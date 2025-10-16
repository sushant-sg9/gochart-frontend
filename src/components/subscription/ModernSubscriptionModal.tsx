import React, { useState, useEffect } from "react";
import { FaTimes, FaStar, FaCheckCircle, FaSpinner, FaQrcode, FaUser, FaCreditCard } from "react-icons/fa";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

interface PaymentPlan {
  _id: string;
  price: number;
  month: number;
  type: "crypto" | "regular";
  qrcodeUrl: string;
  active: boolean;
}

interface ModernSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModernSubscriptionModal: React.FC<ModernSubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [utrNo, setUtrNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user, refreshUser } = useUser();
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchPaymentPlans();
    }
  }, [isOpen]);

  const fetchPaymentPlans = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/payment-info/public/all");
      if (response.success && response.data) {
        setPaymentPlans(response.data);
        // Auto-select first plan
        if (response.data.length > 0) {
          setSelectedPlan(response.data[0]);
        }
      }
    } catch (error: any) {
      showError("Failed to load payment plans", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlan) {
      showError("Please select a payment plan");
      return;
    }

    if (!utrNo.trim()) {
      showError(selectedPlan.type === "crypto" ? "Please enter Order ID" : "Please enter UTR Number");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/user/payment", {
        utrNo,
        Months: selectedPlan.month,
        price: selectedPlan.price,
        type: selectedPlan.type,
        paymentPlanId: selectedPlan._id,
      });

      if (response.success) {
        showSuccess("Payment request submitted successfully!");
        await refreshUser();
        onClose();
        setUtrNo("");
      } else {
        showError(response.message || "Failed to submit payment request");
      }
    } catch (error: any) {
      showError("Payment submission failed", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Show pending status if user has pending payment
  if (user?.status === "pending") {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-slate-700/50 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Payment Status</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4">
              <FaSpinner className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Request Pending</h3>
            <p className="text-gray-400 mb-6">
              Your subscription request is being processed. Please wait for admin approval.
            </p>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div className="bg-yellow-500 h-3 rounded-full animate-pulse" style={{ width: "60%" }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              You will be notified once your payment is confirmed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-4xl border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <FaStar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Premium Subscription</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Plans */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaCreditCard className="w-5 h-5 mr-2 text-blue-500" />
                Choose Your Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentPlans.map((plan) => (
                  <div
                    key={plan._id}
                    className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedPlan?._id === plan._id
                        ? "border-green-500 bg-gradient-to-r from-green-500/10 to-emerald-500/10 shadow-lg shadow-green-500/25"
                        : "border-slate-600 hover:border-slate-500 bg-slate-700/50"
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {selectedPlan?._id === plan._id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-2">
                        {plan.type === "crypto" ? "$" : "₹"}{plan.price}
                      </div>
                      <div className="text-lg text-gray-300 mb-3">
                        {plan.month} {plan.month === 1 ? "Month" : "Months"}
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        plan.type === "crypto" 
                          ? "bg-orange-500/20 text-orange-300" 
                          : "bg-blue-500/20 text-blue-300"
                      }`}>
                        {plan.type === "crypto" ? "USDT Payment" : "UPI Payment"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code Section */}
            {selectedPlan && (
              <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600/50">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaQrcode className="w-5 h-5 mr-2 text-green-500" />
                  Payment QR Code
                </h4>
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <img
                      src={selectedPlan.qrcodeUrl}
                      alt="Payment QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 mb-4">
                      <div className="text-3xl font-bold text-green-400 mb-1">
                        {selectedPlan.type === "crypto" ? "$" : "₹"}{selectedPlan.price}
                      </div>
                      <div className="text-white font-medium">
                        {selectedPlan.month} {selectedPlan.month === 1 ? "Month" : "Months"} Plan
                      </div>
                      <div className="text-sm text-gray-400 mt-1 capitalize">
                        Payment via {selectedPlan.type}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4 text-green-500" />
                        <span>Scan QR code with your mobile banking app</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4 text-green-500" />
                        <span>Complete the payment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4 text-green-500" />
                        <span>Enter {selectedPlan.type === "crypto" ? "order ID" : "UTR number"} below</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form */}
            <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600/50">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaUser className="w-5 h-5 mr-2 text-blue-500" />
                Complete Your Subscription
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {selectedPlan?.type === "crypto" ? "Order ID" : "UTR Number"} 
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={utrNo}
                    onChange={(e) => setUtrNo(e.target.value)}
                    className="w-full bg-slate-600/50 text-white placeholder-gray-400 border border-slate-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={selectedPlan?.type === "crypto" ? "Enter your order ID" : "Enter your UTR number"}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedPlan?.type === "crypto" 
                      ? "18 digit transaction order ID" 
                      : "12-digit UTR number from your payment receipt"}
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedPlan || !utrNo.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg disabled:transform-none disabled:shadow-none flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="w-4 h-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Your subscription will be activated after payment verification.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};