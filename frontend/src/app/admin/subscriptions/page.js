'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  X, 
  Star, 
  Crown, 
  Zap,
  Building,
  Users,
  Briefcase,
  DollarSign,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import useSubscription from '../../../api/useSubscription';
import { toast } from 'react-toastify';

export default function SubscriptionPlans() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { 
    fetchPlans, 
    fetchUserSubscription, 
    createSubscription,
    upgradeSubscription,
    loading: apiLoading,
    error: apiError 
  } = useSubscription();

  // Fetch plans and current subscription on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch available plans
        const plansResponse = await fetchPlans();
        const plansData = plansResponse.data.plans || [];
        
        // Ensure features is always an array
        const normalizedPlans = plansData.map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : 
                   (typeof plan.features === 'string' ? 
                     (plan.features.startsWith('[') ? JSON.parse(plan.features) : [plan.features]) 
                     : [])
        }));
        
        setPlans(normalizedPlans);
        
        // Fetch current subscription
        try {
          const subscriptionResponse = await fetchUserSubscription();
          setCurrentSubscription(subscriptionResponse.data.subscription);
        } catch (subError) {
          // User might not have a subscription yet
          console.log('No current subscription found');
        }
        
      } catch (error) {
        console.error('Error loading subscription data:', error);
        setError('Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpgrade = async (planId) => {
    setLoading(true);
    try {
      let response;
      
      // Check if user has an existing subscription
      if (currentSubscription) {
        // Upgrade existing subscription
        response = await upgradeSubscription(planId, {
          paymentMethod: 'manual',
          transactionId: `txn_${Date.now()}`
        });
      } else {
        // Create new subscription
        response = await createSubscription(planId, {
          paymentMethod: 'manual',
          transactionId: `txn_${Date.now()}`
        });
      }
      
      // Update current subscription
      setCurrentSubscription(response.data.subscription);
      
      // Show success message
      const planName = plans.find(p => p.id === planId)?.name || 'Selected Plan';
      const action = currentSubscription ? 'upgraded to' : 'subscribed to';
      toast.success(`Successfully ${action} ${planName}!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Redirect back to jobs page after a short delay
      setTimeout(() => {
        router.push('/admin/jobs');
      }, 1500);
      
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error(`Failed to upgrade plan: ${error.message || 'Please try again.'}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (plan) => {
    const name = plan.name.toLowerCase();
    if (name.includes('free')) return <Building className="w-8 h-8" />;
    if (name.includes('professional') || name.includes('pro')) return <Star className="w-8 h-8" />;
    if (name.includes('enterprise') || name.includes('premium')) return <Crown className="w-8 h-8" />;
    return <Briefcase className="w-8 h-8" />;
  };

  const getPlanColor = (plan) => {
    const name = plan.name.toLowerCase();
    if (name.includes('free')) return 'border-gray-200 bg-gray-50';
    if (name.includes('professional') || name.includes('pro')) return 'border-blue-200 bg-blue-50';
    if (name.includes('enterprise') || name.includes('premium')) return 'border-purple-200 bg-purple-50';
    return 'border-gray-200 bg-gray-50';
  };

  const getButtonColor = (plan) => {
    const name = plan.name.toLowerCase();
    if (name.includes('free')) return 'bg-gray-600 hover:bg-gray-700';
    if (name.includes('professional') || name.includes('pro')) return 'bg-blue-600 hover:bg-blue-700';
    if (name.includes('enterprise') || name.includes('premium')) return 'bg-purple-600 hover:bg-purple-700';
    return 'bg-gray-600 hover:bg-gray-700';
  };

  const isCurrentPlan = (plan) => {
    return currentSubscription && currentSubscription.planId === plan.id;
  };

  const isPopular = (plan) => {
    // Mark the middle-priced plan as popular, or you can add a 'popular' field to your database
    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);
    return sortedPlans.length >= 3 && plan.id === sortedPlans[1].id;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the perfect plan for your hiring needs. Upgrade or downgrade at any time.
            </p>
          </div>

          {/* Current Plan Status */}
          {currentSubscription ? (
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Current Plan</h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    {currentSubscription.plan?.name || 'Unknown Plan'} - 
                    {currentSubscription.plan?.jobLimit === 0 
                      ? ' Unlimited job postings' 
                      : ` Up to ${currentSubscription.plan?.jobLimit} job postings`
                    }
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Jobs posted: {currentSubscription.jobsPosted || 0} | 
                    Remaining: {currentSubscription.plan?.jobLimit === 0 ? 'Unlimited' : 
                      Math.max(0, (currentSubscription.plan?.jobLimit || 0) - (currentSubscription.jobsPosted || 0))}
                  </p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    ${currentSubscription.amount}
                    <span className="text-xs sm:text-sm font-normal text-gray-600">/{currentSubscription.plan?.duration || 30} days</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Expires: {new Date(currentSubscription.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-yellow-800">No Active Subscription</h2>
                  <p className="text-sm sm:text-base text-yellow-700">You don't have an active subscription. Choose a plan below to start posting jobs.</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Failed to load subscription plans</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          ) : (
            /* Plans Grid */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-lg border-2 ${
                  isPopular(plan) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                } ${getPlanColor(plan)}`}
              >
                {/* Popular Badge */}
                {isPopular(plan) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                      plan.name.toLowerCase().includes('free') ? 'bg-gray-100 text-gray-600' :
                      plan.name.toLowerCase().includes('professional') || plan.name.toLowerCase().includes('pro') ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {getPlanIcon(plan)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description || 'Professional subscription plan'}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.duration} days</span>
                    </div>
                  </div>

                  {/* Job Limit Highlight */}
                  <div className={`text-center p-4 rounded-lg mb-6 ${
                    plan.name.toLowerCase().includes('free') ? 'bg-gray-100' :
                    plan.name.toLowerCase().includes('professional') || plan.name.toLowerCase().includes('pro') ? 'bg-blue-100' :
                    'bg-purple-100'
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      <span className="font-semibold">
                        {plan.jobLimit === 0 ? 'Unlimited' : plan.jobLimit} Job Postings
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">per subscription period</p>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Features included:</h4>
                    <ul className="space-y-3">
                      {Array.isArray(plan.features) && plan.features.length > 0 ? (
                        plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 text-sm">No specific features listed</li>
                      )}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading || isCurrentPlan(plan)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                      isCurrentPlan(plan)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : getButtonColor(plan)
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : isCurrentPlan(plan) ? (
                      'Current Plan'
                    ) : (
                      <div className="flex items-center justify-center">
                        {plan.price === 0 ? 'Downgrade to' : 'Upgrade to'} {plan.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Need a Custom Plan?
              </h3>
              <p className="text-gray-600 mb-6">
                For organizations with specific requirements, we offer custom enterprise solutions.
              </p>
              <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
