export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-6 md:flex md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PicklePro. All rights reserved.
          </p>
        </div>
        <div className="mt-4 flex justify-center md:mt-0">
          <a href="#" className="text-sm text-muted-foreground hover:underline mx-2">
            Terms
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:underline mx-2">
            Privacy
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:underline mx-2">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
} 