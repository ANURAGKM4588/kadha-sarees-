declare global {
  interface Window {
    Razorpay: any;
  }
}

// Securely read Razorpay Public Key ID from environment variables
export function getRazorpayKeyId(): string {
  return import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TPCMiNaTuE4V0B";
}

/**
 * Dynamically loads the official Razorpay Checkout SDK script into the DOM
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayPaymentSuccess {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayCheckoutParams {
  amountInRupees: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNotes?: string;
  onSuccess: (payment: RazorpayPaymentSuccess) => void;
  onFailure?: (error: any) => void;
}

/**
 * Launches the secure Razorpay Payment Modal popup
 */
export async function openRazorpayCheckout({
  amountInRupees,
  customerName,
  customerEmail,
  customerPhone,
  orderNotes,
  onSuccess,
  onFailure,
}: RazorpayCheckoutParams): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert("Razorpay Payment Gateway failed to load. Please check your internet connection.");
    return;
  }

  const key = getRazorpayKeyId();

  const options = {
    key: key,
    amount: Math.round(amountInRupees * 100), // Amount in paise (1 INR = 100 paise)
    currency: "INR",
    name: "Kadha Sarees",
    description: "Handwoven Saree Booking Reservation",
    image: "./logo/Favicon.png",
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone,
    },
    notes: {
      notes: orderNotes || "Handwoven Saree Booking",
    },
    theme: {
      color: "#064e3b", // Deep emerald green matching Kadha Sarees brand
    },
    modal: {
      ondismiss: function () {
        if (onFailure) {
          onFailure({ reason: "Payment cancelled by user" });
        }
      },
    },
    handler: function (response: RazorpayPaymentSuccess) {
      onSuccess(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
