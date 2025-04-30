import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About | About PicklePro</h1>
          
          <div className="prose prose-lg max-w-none">
            <p>
              PicklePro is the premier pickleball court reservation system, designed to make booking your
              next game as simple as possible. Our user-friendly platform allows players to browse
              available courts, select their preferred time slots, and secure their reservations in just a few clicks.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Facilities</h2>
            <p>
              We offer state-of-the-art pickleball courts in multiple locations, including both indoor and
              outdoor options to accommodate your preferences and weather conditions. Each court is
              maintained to professional standards, ensuring an exceptional playing experience.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose PicklePro?</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Easy-to-use online reservation system</li>
              <li>Multiple court options at convenient locations</li>
              <li>Flexible scheduling with hourly time slots</li>
              <li>Instant confirmation and email receipts</li>
              <li>Regular maintenance to ensure court quality</li>
              <li>Option to book private lessons with certified instructors</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p>
              At PicklePro, our mission is to promote the sport of pickleball by providing accessible,
              high-quality courts to players of all skill levels. We believe that convenient access to
              great facilities encourages more people to play, leading to healthier communities and
              the growth of this wonderful sport.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 