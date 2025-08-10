// server/utils/emailTemplates.js
const welcomeEmail = (userName) => {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px;">
                <h2 style="color: #4CAF50;">Welcome to Real Estate App, ${userName}!</h2>
                <p>We're thrilled to have you join our community. Your journey to finding the perfect property or listing your own begins now.</p>
                <p>Explore our wide range of properties for sale or rent, or easily list your own property to connect with potential buyers and tenants.</p>
                <p>If you have any questions or need assistance, feel free to contact our support team.</p>
                <p style="margin-top: 20px;">Happy exploring!</p>
                <p>The Real Estate App Team</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #777; font-size: 0.9em;">
                <p>&copy; 2025 Real Estate App. All rights reserved.</p>
            </div>
        </div>
    `;
};

export { welcomeEmail };