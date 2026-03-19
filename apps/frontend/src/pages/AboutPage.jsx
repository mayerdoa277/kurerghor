import { Link } from 'react-router-dom'
import { 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Shield, 
  Globe,
  Award,
  Target,
  Heart
} from 'lucide-react'

const AboutPage = () => {
  const stats = [
    {
      icon: Users,
      value: '50,000+',
      label: 'Happy Customers'
    },
    {
      icon: ShoppingCart,
      value: '100,000+',
      label: 'Products Sold'
    },
    {
      icon: Package,
      value: '1,000+',
      label: 'Products Available'
    },
    {
      icon: TrendingUp,
      value: '500+',
      label: 'Vendors'
    }
  ]

  const values = [
    {
      title: 'Customer First',
      description: 'We put our customers at the center of everything we do, ensuring their satisfaction and success.',
      icon: Heart
    },
    {
      title: 'Quality Products',
      description: 'We carefully curate and verify all products to ensure they meet our high standards.',
      icon: Shield
    },
    {
      title: 'Innovation',
      description: 'We constantly innovate and improve our platform to provide the best shopping experience.',
      icon: Target
    },
    {
      title: 'Trust & Transparency',
      description: 'We believe in building trust through transparency and honest business practices.',
      icon: Award
    }
  ]

  const team = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      image: '/api/placeholder/150/150',
      bio: 'John founded Ecommerce Platform with a vision to create the best online shopping experience.'
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      image: '/api/placeholder/150/150',
      bio: 'Sarah leads our technical team with over 15 years of experience in e-commerce technology.'
    },
    {
      name: 'Mike Chen',
      role: 'Head of Operations',
      image: '/api/placeholder/150/150',
      bio: 'Mike ensures smooth operations and excellent customer service across all departments.'
    },
    {
      name: 'Emily Davis',
      role: 'Head of Marketing',
      image: '/api/placeholder/150/150',
      bio: 'Emily drives our marketing initiatives and helps us reach customers worldwide.'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          About Ecommerce Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          We're on a mission to revolutionize online shopping by connecting customers with amazing products from trusted vendors around the world.
        </p>
      </div>

      {/* Stats Section */}
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-600">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white rounded-lg p-8 lg:p-12 border border-gray-200 mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Our Story
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 text-center">
            <p className="mb-6">
              Founded in 2020, Ecommerce Platform started as a simple idea: create a marketplace where quality products meet exceptional service. What began as a small startup has grown into a thriving community of shoppers and vendors.
            </p>
            
            <p className="mb-6">
              Our journey has been driven by a passion for innovation and a commitment to customer satisfaction. We've faced challenges, celebrated victories, and learned valuable lessons along the way.
            </p>
            
            <p>
              Today, we're proud to serve thousands of customers and support hundreds of vendors who share our vision for a better e-commerce experience.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-8 h-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
          </div>
          
          <p className="text-gray-700 leading-relaxed">
            To provide a trusted, innovative, and user-friendly e-commerce platform that connects customers with quality products while empowering vendors to grow their businesses.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-8 h-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
          </div>
          
          <p className="text-gray-700 leading-relaxed">
            To become the world's most customer-centric e-commerce platform, where shopping is not just a transaction but an experience to be enjoyed.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Our Values
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Meet Our Team
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden mx-auto mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">
                {member.name}
              </h3>
              
              <p className="text-primary-600 font-medium mb-3">
                {member.role}
              </p>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 rounded-lg p-8 lg:p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Ready to Join Our Community?
        </h2>
        
        <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
          Whether you're looking to shop amazing products or start selling, we're here to help you succeed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/products" 
            className="btn bg-white text-primary-600 hover:bg-gray-100 font-medium"
          >
            Start Shopping
          </Link>
          
          <Link 
            to="/vendors" 
            className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 font-medium"
          >
            Become a Vendor
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
