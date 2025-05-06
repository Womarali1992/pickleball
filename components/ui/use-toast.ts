// Adapted from shadcn UI toast component
// https://ui.shadcn.com/docs/components/toast

// Simple mock implementation for toast notifications
type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  if (typeof window !== 'undefined') {
    // Log toast for now
    console.log(`[${variant}] ${title}: ${description}`);
    
    // In a real implementation, this would dispatch to a toast UI component
    // For now, we're just mocking the functionality
    
    // Alert for visible feedback
    if (variant === 'destructive') {
      // For errors, use alert so it's visible
      window.alert(`${title}\n${description}`);
    }
  }
  
  return {
    dismiss: () => {},
    update: (props: Partial<ToastProps>) => {}
  };
}; 