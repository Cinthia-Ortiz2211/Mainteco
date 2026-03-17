export const paymentOptions = {
    bankTransfer: {
        name: "Bank Transfer",
        description: "Direct transfer from your bank account.",
    },
    cash: {
        name: "Cash",
        description: "Payment made in cash at the time of service.",
    },
    qrCode: {
        name: "QR Code",
        description: "Payment via QR code from a virtual wallet.",
    },
};

export const getPaymentOptions = () => {
    return Object.values(paymentOptions);
};