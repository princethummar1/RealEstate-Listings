# prediction_app/views.py
import os
import pickle
import numpy as np
import pandas as pd

from django.conf import settings        # <= use Django’s BASE_DIR
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from sklearn.preprocessing import LabelEncoder


# ---------------------------------------------------------------------------
# 1.  Paths to model artefacts
# ---------------------------------------------------------------------------
ARTIFACT_DIR         = os.path.join(settings.BASE_DIR, 'model_artifacts')   # <== ONE place to change
MODEL_PATH           = os.path.join(ARTIFACT_DIR, 'price_prediction_model.pkl')
LOCATION_ENCODER_PATH = os.path.join(ARTIFACT_DIR, 'location_encoder.pkl')
FURNISHING_ENCODER_PATH = os.path.join(ARTIFACT_DIR, 'furnishing_encoder.pkl')
ONE_HOT_COLS_PATH    = os.path.join(ARTIFACT_DIR, 'one_hot_cols.pkl')

# ---------------------------------------------------------------------------
# 2.  Globals that hold the ML objects
# ---------------------------------------------------------------------------
model               : object | None = None
location_encoder    : LabelEncoder | None = None
furnishing_encoder  : LabelEncoder | None = None
MODEL_EXPECTED_FEATURES : list[str] = []      # exact order the model was fitted with


# ---------------------------------------------------------------------------
# 3.  Helper to load everything once at start-up
# ---------------------------------------------------------------------------
def load_ml_artifacts() -> bool:
    global model, location_encoder, furnishing_encoder, MODEL_EXPECTED_FEATURES

    print("\n―― Loading ML artefacts ――")
    print("Artefact directory:", ARTIFACT_DIR)

    try:
        for path_, label in [
                (MODEL_PATH,            "model"),
                (LOCATION_ENCODER_PATH, "location encoder"),
                (FURNISHING_ENCODER_PATH, "furnishing encoder"),
                (ONE_HOT_COLS_PATH,     "one-hot column list")]:
            if not os.path.exists(path_):
                print(f"❌  {label} not found at {path_}")
                return False

        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        with open(LOCATION_ENCODER_PATH, 'rb') as f:
            location_encoder = pickle.load(f)
        with open(FURNISHING_ENCODER_PATH, 'rb') as f:
            furnishing_encoder = pickle.load(f)
        with open(ONE_HOT_COLS_PATH, 'rb') as f:
            MODEL_EXPECTED_FEATURES = pickle.load(f)

        print("✅  All artefacts loaded.  Model expects →")
        print(MODEL_EXPECTED_FEATURES)
        return True

    except Exception as exc:
        print("‼️  Error while loading artefacts:", exc)
        model = location_encoder = furnishing_encoder = None
        MODEL_EXPECTED_FEATURES.clear()
        return False


# load once when Django imports this module
if not load_ml_artifacts():
    print("⚠️  Prediction service will not be available until artefacts are present.")


# ---------------------------------------------------------------------------
# 4.  REST endpoint
# ---------------------------------------------------------------------------
@api_view(['POST'])
def predict_price(request):
    """
    POST body:
    {
        "location": "Ahmedabad",
        "bhk": 2,
        "sqft": 1100,
        "furnishing_status": "Unfurnished",
        "property_type": "Apartment"
    }
    """
    if model is None:
        return Response(
            {"error": "Model not loaded on server."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        payload = request.data

        # ------------- Basic presence check -----------------
        required = ['location', 'bhk', 'sqft', 'furnishing_status', 'property_type']
        missing  = [k for k in required if payload.get(k) in [None, ""]]
        if missing:
            return Response(
                {"error": f"Missing fields: {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ------------------------------------------------------------------
        # A.   Encode location   (NO .lower() because encoders saw real case)
        # ------------------------------------------------------------------
        try:
            loc_encoded = location_encoder.transform([payload['location'].strip()])[0]
        except ValueError:
            return Response(
                {"error": f'Unknown location "{payload["location"]}". '
                          f'Known values: {", ".join(location_encoder.classes_)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ------------------------------------------------------------------
        # B.   Encode furnishing status
        # ------------------------------------------------------------------
        try:
            furn_encoded = furnishing_encoder.transform([payload['furnishing_status'].strip()])[0]
        except ValueError:
            return Response(
                {"error": f'Unknown furnishing_status "{payload["furnishing_status"]}". '
                          f'Known values: {", ".join(furnishing_encoder.classes_)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ------------------------------------------------------------------
        # C.   Build the one-row DataFrame in the *exact* column order
        # ------------------------------------------------------------------
        features_dict = {col: [0] for col in MODEL_EXPECTED_FEATURES}  # start with zeros

        # Columns that are always present
        features_dict['City_Encoded']            = [loc_encoded]
        features_dict['BHK']                     = [float(payload['bhk'])]
        features_dict['Super_Builtup_Area']      = [float(payload['sqft'])]
        features_dict['Furnishing_status_Encoded'] = [furn_encoded]

        # One-hot for property_type
        dummy_col = f"PropertyType_{payload['property_type'].strip()}"
        if dummy_col in MODEL_EXPECTED_FEATURES:
            features_dict[dummy_col] = [1]   # if it existed during training

        X = pd.DataFrame(features_dict, columns=MODEL_EXPECTED_FEATURES)  # enforce order

        # ------------------------------------------------------------------
        # D.   Predict
        # ------------------------------------------------------------------
        price_in_inr = model.predict(X)[0]
        price_in_inr = max(0, price_in_inr)   # guard against negatives

        return Response(
            {
                "predictedPrice": round(price_in_inr),
                "currency": "INR",
                "details": f'{payload["bhk"]}-BHK {payload["property_type"]} '
                           f'{payload["sqft"]} sqft in {payload["location"]}'
            },
            status=status.HTTP_200_OK
        )

    # ------------------ Any unexpected error ------------------------------
    except Exception as exc:
        print("❗ Error in predict_price:", exc)
        return Response({"error": f"Internal server error: {exc}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
