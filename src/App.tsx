import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Typewriter from 'typewriter-effect';
import { supabase } from '../src/Admin/lib/supabase';
import {
  Cpu,
  Radio,
  Activity,
  Shield,
  Zap,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Linkedin,
  Twitter,
  Menu,
  X
} from 'lucide-react';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);


  return (
    <div className="min-h-screen bg-gray-50">
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Hero />
      <About />
      <Products />
      <Features />
      <Contact />
      <Footer />
    </div>
  );
}

function Header({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean, setMobileMenuOpen: (open: boolean) => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-7 py-0 flex justify-between items-center h-18">
        <div className="flex items-center">
          <Logo />
        </div>

        <nav className="hidden md:flex items-center space-x-14">
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
    <a href="www.miccroten.com" className="flex items-center space-x-0 text-xl font-bold text-primary-700">
      <img src="/assets/logo.png" alt="logo" mt-6 height={"110px"} width={"110px"} />
      <span>MICCROTEN Technologies</span>
    </a>
  );
}

function NavLinks() {
  return (
    <>
      <a href="#about" className="text-gray-700 hover:text-primary-600 font-medium">About</a>
      <a href="#products" className="text-gray-700 hover:text-primary-600 font-medium">Products</a>
      <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium">Features</a>
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
                <img src="/assets/main_img.webp" alt="MICCROTEN Technology"
                  className="rounded-xl shadow-2xl"
                  height={"500px"} width={'800px'} />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-2">
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
        {/* <a href="#contact" className="text-primary-600 font-medium flex items-center hover:text-primary-700">
          Learn more
          <ChevronRight className="ml-1 h-4 w-4" />
        </a> */}
      </div>
    </motion.div>
  );
}

const products = [
  {
    icon: Radio,
    title: "Advanced RFID Solutions with AI",
    description: "Our RFID technology offers seamless tracking and identification capabilities for inventory management, access control, and supply chain optimization.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzxB-PNuTNtaWpMVmaaPGbtrLT0uRWq5p1gyYXhKZDBj4c4l_nPtuWe6u_KVY8thon9f4&usqp=CAU"
  },
  {
    icon: Activity,
    title: "Biomedical IoT Applications",
    description: "Our biomedical IoT solutions enable remote patient monitoring, medical device connectivity, and healthcare data analytics for improved patient outcomes.",
    image: "/assets/bio-med.jpg"
  },
  {
    icon: Activity,
    title: "IoT Applications with AI",
    description: "We provides smart, reliable IoT electronics tailored to your needs. We design and build custom products for real-time connectivity, automation, and intelligent solutions—just the way you need them.",
    image: "/assets/IoT.jpg"
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

// function ContactForm() {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     subject: '',
//     message: ''
//   });
//   const [status, setStatus] = useState({
//     type: '',
//     message: ''
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.id]: e.target.value
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setStatus({ type: '', message: '' });

//     const templateParams = {
//       from_name: formData.name,
//       from_email: formData.email,
//       subject: formData.subject,
//       message: formData.message,
//     };

//     try {
//       console.log('Sending email with params:', templateParams);
//       const result = await emailjs.send(
//         'service_3waj02d',
//         'template_zo8bd07',
//         templateParams
//       );

//       console.log('EmailJS response:', result);

//       if (result.text === 'OK') {
//         setStatus({
//           type: 'success',
//           message: 'Thank you for your message. We will get back to you soon!'
//         });
//         setFormData({ name: '', email: '', subject: '', message: '' });
//       } else {
//         throw new Error('Unexpected response from EmailJS');
//       }
//     } catch (error: any) {
//       console.error('EmailJS detailed error:', {
//         message: error.message,
//         text: error.text,
//         status: error.status,
//         response: error.response
//       });
//       setStatus({
//         type: 'error',
//         message: error.text || 'There was an error sending your message. Please try again later.'
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="card p-6">
//       <h3 className="text-xl font-bold mb-4">Send us a message</h3>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//             Full Name
//           </label>
//           <input
//             type="text"
//             id="name"
//             value={formData.name}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
//             placeholder="Your name"
//             required
//           />
//         </div>
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//             Email Address
//           </label>
//           <input
//             type="email"
//             id="email"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
//             placeholder="your.email@example.com"
//             required
//           />
//         </div>
//         <div>
//           <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
//             Subject
//           </label>
//           <input
//             type="text"
//             id="subject"
//             value={formData.subject}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
//             placeholder="How can we help you?"
//             required
//           />
//         </div>
//         <div>
//           <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
//             Message
//           </label>
//           <textarea
//             id="message"
//             value={formData.message}
//             onChange={handleChange}
//             rows={4}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
//             placeholder="Your message here..."
//             required
//           ></textarea>
//         </div>
//         {status.message && (
//           <div className={`p-4 rounded-lg ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
//             {status.message}
//           </div>
//         )}
//         <button 
//           type="submit" 
//           className="btn btn-primary w-full"
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? 'Sending...' : 'Send Message'}
//         </button>
//       </form>
//     </div>
//   );
// }

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({
    type: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          read: false  // Only include columns that exist in your table
          // Removed 'private' column since it doesn't exist
        }]);

      if (error) throw error;

      setStatus({
        type: 'success',
        message: 'Thank you for your message. We will get back to you soon!'
      });
      setFormData({ name: '', email: '',phone: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Supabase error:', error);
      setStatus({
        type: 'error',
        message: error.message || 'There was an error sending your message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold mb-4">Send us a message</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="your.email@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Phone No.
          </label>
          <input
            type="text"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter your Phone No here"
            required
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="How can we help you?"
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Your message here..."
            required
          ></textarea>
        </div>
        {status.message && (
          <div className={`p-4 rounded-lg ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {status.message}
          </div>
        )}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
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
              <p className="text-gray-600">miccroten03@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-primary-600 mt-1 mr-3" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-gray-600">+91 7795155237</p>
              <p className="text-gray-600">+91 9207141737</p>
            </div>
          </div>
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-primary-600 mt-1 mr-3" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-gray-600">
                New BEL Rd, Venkatachari Nagar <br />
                R.M.V. Extension 2nd Stage, North Bengaluru<br />
                Bengaluru-560094<br />
                Karnataka,India
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-0 text-xl font-bold mb-4">
              <img src="/assets/footer-logo.png" alt="Footer Logo" height="80px" width="80px" />
              <span>MICCROTEN</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md text-justify">
              Pioneering electronic development with cutting-edge RFID and Biomedical IoT solutions for a smarter, more connected world.
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com/Miccroten" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/miccroten" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/miccroten/" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#products" className="text-gray-400 hover:text-white transition-colors">Products</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              {/* <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li> */}
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Products</h3>
            <ul className="space-y-2">
              <li><a href="#products" className="text-gray-400 hover:text-white transition-colors">RFID Solutions</a></li>
              <li><a href="#products" className="text-gray-400 hover:text-white transition-colors">Biomedical IoT</a></li>
              <li><a href="#products" className="text-gray-400 hover:text-white transition-colors">IoT Applications with AI</a></li>
              {/* <li><a href="#products" className="text-gray-400 hover:text-white transition-colors">Custom Development</a></li> */}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} MICCROTEN. All rights reserved.
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

export default App;
