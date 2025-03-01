import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Typewriter from 'typewriter-effect';
import { 
  Cpu, 
  Radio, 
  // Smartphone, 
  Activity, 
  Shield, 
  Zap, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  Twitter, 
  Menu, 
  X
} from 'lucide-react';
// import { img } from 'framer-motion/client';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Hero />
      <About />
      <Products />
      <Features />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}

function Header({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean, setMobileMenuOpen: (open: boolean) => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-7 py-0 flex justify-between items-center">
        <div className="flex items-center">
          <Logo/>
        </div>
        
        <nav className="hidden md:flex items-center space-x-9">
          <NavLinks />
          <a href="#contact" className="btn btn-primary">Contact Us</a>
        </nav>
        
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <MobileNavLinks setMobileMenuOpen={setMobileMenuOpen} />
            <a 
              href="#contact" 
              className="btn btn-primary w-full text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Logo() {
  return (
    <a href="#" className="flex items-center space-x-0 text-xl font-bold text-primary-700">
      <img src="src/images/logo.png" alt="logo" height={"100px"} width={"100px"}/>
      <span>MICCROTEN</span>
    </a>
  );
}

function NavLinks() {
  return (
    <>
      <a href="#about" className="text-gray-700 hover:text-primary-600 font-medium">About</a>
      <a href="#products" className="text-gray-700 hover:text-primary-600 font-medium">Products</a>
      <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium">Features</a>
      <a href="#testimonials" className="text-gray-700 hover:text-primary-600 font-medium">Testimonials</a>
    </>
  );
}

function MobileNavLinks({ setMobileMenuOpen }: { setMobileMenuOpen: (open: boolean) => void }) {
  return (
    <>
      <a 
        href="#about" 
        className="text-gray-700 hover:text-primary-600 font-medium py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        About
      </a>
      <a 
        href="#products" 
        className="text-gray-700 hover:text-primary-600 font-medium py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        Products
      </a>
      <a 
        href="#features" 
        className="text-gray-700 hover:text-primary-600 font-medium py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        Features
      </a>
      <a 
        href="#testimonials" 
        className="text-gray-700 hover:text-primary-600 font-medium py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        Testimonials
      </a>
    </>
  );
}

function Hero() {
  return (
    <section className="pt-28 pb-20 md:pt-32 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center md:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins mb-4">
                <span className="block">Welcome to</span>
                <span className="text-blue-600">
                  <Typewriter
                    options={{
                      strings: ['MICCROTEN'],
                      autoStart: true,
                      loop: true,
                      delay: 150,
                      deleteSpeed: 150,
                    }}
                  />
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0">
                Pioneering electronic development with cutting-edge Biomedical IoT solutions with AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="#products" className="btn btn-primary">
                  Explore Products
                  <ChevronRight className="ml-2 h-5 w-5" />
                </a>
                <a href="#contact" className="btn btn-secondary">
                  Get in Touch
                </a>
              </div>
            </motion.div>
          </div>
          
          <div className="md:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="animate-float">
                <img 
                  src="src/images/main_img.webp" 
                  alt="MICCROTEN Technology" 
                  className="rounded-xl shadow-2xl"
                  height={"500px"} width={'800px'}
                />
              </div>
              <div className="absolute -bottom-4 -left-4 h-24 w-24 bg-primary-500 rounded-lg opacity-20"></div>
              <div className="absolute -top-4 -right-0 h-24 w-24 bg-secondary-500 rounded-lg opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="section-title">About <span className="text-gradient">MICCROTEN</span></h2>
          <p className="section-subtitle">
            We are a forward-thinking electronic development company dedicated to creating innovative solutions that transform industries.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {aboutCards.map((card, index) => (
            <AboutCard key={index} icon={card.icon} title={card.title} description={card.description} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutCard({ icon: Icon, title, description, delay }: { icon: React.ElementType, title: string, description: string, delay: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="card p-6"
    >
      <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

const aboutCards = [
  {
    icon: Cpu,
    title: "Innovative Technology",
    description: "We develop cutting-edge electronic solutions that push the boundaries of what's possible."
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Our products undergo rigorous testing to ensure reliability and performance in all conditions."
  },
  {
    icon: Zap,
    title: "Rapid Development",
    description: "We bring ideas to market quickly without compromising on quality or functionality."
  }
];

function Products() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <section id="products" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="section-title">Our <span className="text-gradient">Products</span></h2>
          <p className="section-subtitle">
            Discover our range of innovative electronic solutions designed to meet the evolving needs of various industries.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          {products.map((product, index) => (
            <ProductCard 
              key={index} 
              icon={product.icon} 
              title={product.title} 
              description={product.description} 
              image={product.image}
              delay={index * 0.1} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ icon: Icon, title, description, image, delay }: { 
  icon: React.ElementType, 
  title: string, 
  description: string, 
  image: string,
  delay: number 
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="card overflow-hidden flex flex-col md:flex-row"
    >
      <div className="md:w-2/5">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-6 md:w-3/5">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center mr-3">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <a href="#contact" className="text-primary-600 font-medium flex items-center hover:text-primary-700">
          Learn more
          <ChevronRight className="ml-1 h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
}

const products = [
  {
    icon: Radio,
    title: "Advanced RFID Solutions",
    description: "Our RFID technology offers seamless tracking and identification capabilities for inventory management, access control, and supply chain optimization.",
    image: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    icon: Activity,
    title: "Biomedical IoT Applications",
    description: "Our biomedical IoT solutions enable remote patient monitoring, medical device connectivity, and healthcare data analytics for improved patient outcomes.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  }
];

function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="section-title">Key <span className="text-gradient">Features</span></h2>
          <p className="section-subtitle">
            Our products are designed with cutting-edge features that set them apart from the competition.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => (
            <FeatureCard key={index} title={feature.title} description={feature.description} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, description, delay }: { title: string, description: string, delay: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="card p-6"
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

const features = [
  {
    title: "Real-time Monitoring",
    description: "Track and analyze data in real-time for immediate insights and decision-making."
  },
  {
    title: "Secure Encryption",
    description: "Advanced encryption protocols ensure your data remains secure and protected."
  },
  {
    title: "Cloud Integration",
    description: "Seamlessly connect with cloud platforms for data storage and processing."
  },
  {
    title: "Scalable Architecture",
    description: "Our solutions grow with your business, adapting to changing needs and requirements."
  },
  {
    title: "Energy Efficient",
    description: "Low power consumption extends battery life and reduces operational costs."
  },
  {
    title: "User-friendly Interface",
    description: "Intuitive controls and displays make our products easy to use and manage."
  }
];

function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="section-title">Client <span className="text-gradient">Testimonials</span></h2>
          <p className="section-subtitle">
            Don't just take our word for it. Here's what our clients have to say about our products and services.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={index} 
              name={testimonial.name} 
              role={testimonial.role} 
              company={testimonial.company}
              quote={testimonial.quote}
              image={testimonial.image}
              delay={index * 0.1} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ name, role, company, quote, image, delay }: { 
  name: string, 
  role: string, 
  company: string,
  quote: string,
  image: string,
  delay: number 
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="card p-6"
    >
      <div className="flex items-center mb-4">
        <img 
          src={image} 
          alt={name} 
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h3 className="font-bold">{name}</h3>
          <p className="text-sm text-gray-600">{role}, {company}</p>
        </div>
      </div>
      <p className="text-gray-700 italic">"{quote}"</p>
    </motion.div>
  );
}

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CTO",
    company: "HealthTech Inc.",
    quote: "MICCROTEN's biomedical IoT solutions have revolutionized our patient monitoring systems. The reliability and accuracy of their technology is unmatched.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  },
  {
    name: "Michael Chen",
    role: "Operations Director",
    company: "LogiTrack Systems",
    quote: "Implementing MICCROTEN's RFID technology has increased our inventory accuracy by 99.8% and reduced processing time by 65%. A game-changer for our business.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  },
  {
    name: "Emily Rodriguez",
    role: "Innovation Lead",
    company: "FutureMed",
    quote: "The team at MICCROTEN doesn't just provide products; they offer solutions. Their understanding of our needs and technical expertise has made them an invaluable partner.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  }
];

function Contact() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="section-title">Get in <span className="text-gradient">Touch</span></h2>
          <p className="section-subtitle">
            Have questions or interested in our products? Reach out to us and our team will get back to you shortly.
          </p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row gap-12 mt-12">
          <div className="md:w-1/2">
            <ContactForm />
          </div>
          <div className="md:w-1/2">
            <ContactInfo />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold mb-4">Send us a message</h3>
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="your.email@example.com"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="How can we help you?"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Your message here..."
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Send Message
        </button>
      </form>
    </div>
  );
}

function ContactInfo() {
  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-primary-600 mt-1 mr-3" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-gray-600">info@miccroten.com</p>
            </div>
          </div>
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-primary-600 mt-1 mr-3" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-primary-600 mt-1 mr-3" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-gray-600">
                123 Tech Park Avenue<br />
                Innovation District<br />
                San Francisco, CA 94105
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">Business Hours</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Monday - Friday</span>
            <span className="font-medium">9:00 AM - 6:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Saturday</span>
            <span className="font-medium">10:00 AM - 4:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sunday</span>
            <span className="font-medium">Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 text-xl font-bold mb-4">
              <Cpu className="h-6 w-6" />
              <span>MICCROTEN</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Pioneering electronic development with cutting-edge RFID and Biomedical IoT solutions for a smarter, more connected world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#products" className="text-gray-400 hover:text-white transition-colors">Products</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Products</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">RFID Solutions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Biomedical IoT</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Software Services</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Custom Development</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} MICCROTEN. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


export default App