import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '../components/Layout/Navbar';
import { Card } from '@/components/ui/card';
import {
  Smartphone,
  CreditCard,
  MessageSquare,
  BarChart2,
  Search,
  FileText,
  Utensils,
  CheckCircle,
  Check,
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Store,
  Badge,
  Rocket,
  Building,
  TrendingUp,
  Shield,
  Clock,
  Headphones
} from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [isYearly, setIsYearly] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar hideShops={true} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Skip the Line with <span className="text-orange-500">Stackorq</span>
                </h1>
                <p className="text-xl text-gray-300">
                  Order ahead, track your arrival time, and have your food ready when you get there.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    size="lg"
                    onClick={() => navigate('/customer/menu')}
                  >
                    Order Now
                  </Button>
                  {!localStorage.getItem('currentUser') && (
                    <Button
                      variant="outline"
                      className="border-white text-slate-600 hover:bg-white hover:text-black transform transition-all duration-300 hover:scale-105 animate-smooth"                      size="lg"
                      onClick={() => navigate('/register')}
                    >
                      Register                    
                    </Button>
                  )}
                </div>              
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Delicious Food"
                  className="rounded-lg shadow-xl w-full h-auto max-h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose Stackorq</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform offers a seamless experience for both customers and
                restaurant owners with features designed to make food ordering
                efficient and enjoyable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Smartphone className="w-5 h-5" />,
                  title: "Order Anytime, Anywhere",
                  description:
                    "Place orders from the comfort of your home or on the go. Our platform is accessible 24/7.",
                },
                {
                  icon: <CreditCard className="w-5 h-5" />,
                  title: "Secure Online Payments",
                  description:
                    "Pay securely online with multiple payment options. Funds are directly transferred to restaurant owners.",
                },
                {
                  icon: <MessageSquare className="w-5 h-5" />,
                  title: "Real-time Chat Support",
                  description:
                    "Communicate directly with restaurant owners about your order specifications or delivery details.",
                },
                {
                  icon: <BarChart2 className="w-5 h-5" />,
                  title: "Order Analytics",
                  description:
                    "Restaurant owners get access to comprehensive analytics to track sales, popular items, and customer preferences.",
                },
                {
                  icon: <Search className="w-5 h-5" />,
                  title: "Explore Multiple Restaurants",
                  description:
                    "Browse through various restaurants, cuisines, and dishes all in one platform.",
                },
                {
                  icon: <FileText className="w-5 h-5" />,
                  title: "Digital Bill Management",
                  description:
                    "Download and access your bills anytime. Restaurant owners can manage all transactions digitally.",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-shadow duration-300 h-full"
                >
                  <div className="bg-orange-100 text-orange-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How Stackorq Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform connects hungry customers with their favorite
                restaurants through a simple and efficient process.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  icon: <Search className="w-6 h-6" />,
                  title: "Browse Restaurants",
                  description:
                    "Explore restaurants and menus in your area with easy filtering options.",
                },
                {
                  icon: <Utensils className="w-6 h-6" />,
                  title: "Select Your Food",
                  description:
                    "Choose your favorite dishes and customize them according to your preferences.",
                },
                {
                  icon: <CreditCard className="w-6 h-6" />,
                  title: "Pay Securely",
                  description:
                    "Complete your order with our secure payment gateway supporting multiple payment methods.",
                },
                {
                  icon: <CheckCircle className="w-6 h-6" />,
                  title: "Enjoy Your Meal",
                  description:
                    "Track your order in real-time and enjoy your meal when it's ready or delivered.",
                },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative">
                    <div className="bg-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      {step.icon}
                    </div>
                    {index < 3 && (
                      <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-300"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* App Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Powerful Features for Customers & Restaurant Owners
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      title: "Real-time Order Tracking",
                      description:
                        "Track your order status in real-time from preparation to delivery or pickup.",
                    },
                    {
                      title: "Secure Payment Processing",
                      description:
                        "Multiple payment options with secure transactions and instant transfers to restaurant accounts.",
                    },
                    {
                      title: "In-app Chat Support",
                      description:
                        "Direct communication channel between customers and restaurant owners for order clarifications.",
                    },
                    {
                      title: "Business Analytics Dashboard",
                      description:
                        "Comprehensive analytics for restaurant owners to track sales, popular items, and customer preferences.",
                    },
                  ].map((feature, index) => (
                    <div key={index} className="flex">
                      <div className="bg-orange-100 text-orange-500 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-8 bg-orange-500 hover:bg-orange-600">
                  Explore All Features <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Stackorq App Interface"
                  className="w-full rounded-lg shadow-xl h-auto max-h-[500px] object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center">
                    <div className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Average Order Value</p>
                      <p className="text-lg font-bold">$32.75</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Active Users</p>
                      <p className="text-lg font-bold">10,000+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-orange-500 text-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Food Ordering Experience?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of satisfied customers and restaurant partners on
              Stackorq today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-6 text-lg">
                <Utensils className="mr-2 w-5 h-5" /> Order as Customer
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-white hover:bg-white/10 text-white px-8 py-6 text-lg"
              >
                <Store className="mr-2 w-5 h-5" /> Register Restaurant
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm mb-4">
                Exclusive Limited Time Offer
              </span>
              <h2 className="text-4xl font-bold mb-4">
                Affordable Pricing for Maximum Profits
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Join thousands of successful restaurant owners who have boosted
                their revenue by up to 35% with our competitive pricing plans.
              </p>
            </div>
            <div className="flex justify-center mb-8">
              <div className="bg-gray-800 p-1 rounded-full">
                <button
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    isYearly ? 'text-gray-400' : 'bg-orange-500 text-white'
                  }`}
                  onClick={() => setIsYearly(false)}
                >
                  Monthly
                </button>
                <button
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    isYearly ? 'bg-orange-500 text-white' : 'text-gray-400'
                  }`}
                  onClick={() => setIsYearly(true)}
                >
                  Yearly
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols- gap-8">
              {[
                {
                  name: "Growth",
                  price: isYearly ? "₹11990" : "₹1199",
                  description:
                    "Ideal for growing restaurants with regular online orders",
                  features: [
                    "7 days free trial",
                    "All Starter features",
                    "Advanced analytics",
                    "Priority customer support",
                    "Marketing tools",
                    "Customer insights",
                  ],
                  popular: true,
                  icon: <TrendingUp className="w-6 h-6" />,
                },
              ].map((plan, index) => (
                <Card
                  key={index}
                  className={`relative h-full transform hover:scale-105 transition-transform duration-300 ${plan.popular ? "border-4 border-orange-500 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl" : "bg-gray-800"}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 text-lg font-bold animate-pulse">
                        🔥 Exclusive Offer 🔥
                      </Badge>
                    </div>
                  )}
                  <div className="p-8 h-full flex flex-col">
                    <div className="text-center mb-8">
                      <div
                        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 transform hover:rotate-12 transition-transform duration-300 ${plan.popular ? "bg-gradient-to-r from-orange-500 to-red-600 text-white" : "bg-gray-700 text-orange-500"}`}
                      >
                        {plan.icon}
                      </div>
                      <h3 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">{plan.name}</h3>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-5xl font-bold text-orange-500">{plan.price}</span>
                        {plan.price !== "Custom" && (
                          <span className="ml-1 text-gray-400">{isYearly ? "per year" : "per month"}</span>
                        )}
                      </div>
                      {isYearly && (
                        <div className="text-orange-500 text-sm mb-2">Save 20% with yearly billing</div>
                      )}
                      <p className="text-gray-300 mb-6 text-lg">
                        {plan.description}
                      </p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <CheckCircle className="w-6 h-6 text-orange-500 mt-0.5 mr-3 flex-shrink-0 animate-bounce" />
                          <span className="text-gray-200 text-lg">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-auto text-lg font-bold py-4 transform hover:scale-105 transition-all duration-300 ${plan.popular
                        ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg"
                        : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                      Get Started Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>            <div className="mt-12 text-center">
              <p className="text-gray-400 mb-6">
                All plans include a 30-day money-back guarantee
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span>Instant Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-orange-500" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Hear from our satisfied customers and restaurant partners about
                their experience with Stackorq.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Priya Sharma",
                  role: "Regular Customer",
                  quote:
                    "Stackorq has completely changed how I order food. The real-time tracking and chat feature are game-changers. I love being able to communicate directly with the restaurant.",
                  avatar: "https://randomuser.me/api/portraits/women/67.jpg",
                },
                {
                  name: "Rajesh Patel",
                  role: "Restaurant Owner",
                  quote:
                    "As a restaurant owner, Stackorq has streamlined our ordering process and increased our revenue. The analytics dashboard gives me valuable insights into my business performance.",
                  avatar: "https://randomuser.me/api/portraits/men/82.jpg",
                },
                {
                  name: "Anjali Desai",
                  role: "Food Blogger",
                  quote:
                    "I've tried many food ordering platforms, but Stackorq stands out with its user-friendly interface and variety of restaurant options. The payment process is seamless and secure.",
                  avatar: "https://randomuser.me/api/portraits/women/94.jpg",
                },
              ].map((testimonial, index) => (
                <Card key={index} className="bg-gray-800 border-0 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">{testimonial.name}</h3>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                  <div className="mt-4 text-orange-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Stackorq</h3>
              <p className="text-gray-400 leading-relaxed">
                Skip the wait and enjoy your food fresh and hot, exactly when you arrive.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Menu</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">About Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <MapPin className="mt-1 mr-3 text-orange-500 w-5 h-5" />
                  <span className="text-gray-400">
                    123 Food Street, Cuisine City, FC 12345
                  </span>
                </li>
                <li className="flex items-start">
                  <Phone className="mt-1 mr-3 text-orange-500 w-5 h-5" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start">
                  <Mail className="mt-1 mr-3 text-orange-500 w-5 h-5" />
                  <span className="text-gray-400">support@stackorq.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center">
            <div className="space-x-4 mb-8">
              <a href="/privacy.html" target="_blank" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</a>
              <span className="text-gray-600">|</span>
              <a href="/terms.html" target="_blank" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</a>
              <span className="text-gray-600">|</span>
            </div>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-400">&copy; {new Date().getFullYear()} Stackorq. All rights reserved.</p>
              <p className="text-gray-400 mt-2">
                <strong className="text-white">Stackorq</strong> - powered by <strong className="text-white">Soloweb Technologies</strong> — empowering restaurants with digital order and UPI payment tools.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;