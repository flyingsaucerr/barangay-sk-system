import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export function FeedbackButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group z-50"
      size="lg"
    >
      <MessageSquare className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
      Give Feedback
    </Button>
  );
}