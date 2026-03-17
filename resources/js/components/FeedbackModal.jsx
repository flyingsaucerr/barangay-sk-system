// components/FeedbackModal.jsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";

const ratingScale = [
  { value: 1, label: "Poor", description: "Needs improvement" },
  { value: 2, label: "Fair", description: "Acceptable, but could be improved" },
  { value: 3, label: "Good", description: "Satisfactory" },
  { value: 4, label: "Very Good", description: "Excellent" },
];

const questions = [
  { id: 1, text: "Is the website easy to access, and can you open it without difficulty on your device?" },
  { id: 2, text: "Is navigating the website straightforward, allowing you to find information quickly?" },
  { id: 3, text: "Are the menus and sections organized clearly, making it simple to understand the layout?" },
  { id: 4, text: "Is the text on the website clear, legible, and easy to read?" },
  { id: 5, text: "Does the overall design of the website look professional and visually appealing?" },
  { id: 6, text: "Does the website load quickly without delays when opening pages or content?" },
  { id: 7, text: "Can the website be accessed and used effectively on mobile devices or tablets?" },
  { id: 8, text: "Are the images, icons, and visual elements on the website clear and appropriate?" },
  { id: 9, text: "Are announcements and updates presented in a way that makes them easy to notice?" },
  { id: 10, text: "Is information regarding barangay projects easy to locate and understand?" },
  { id: 11, text: "Is it convenient to submit requests online, and is the process simple to follow?" },
  { id: 12, text: "Can you easily check the status or details of submitted requests through the website?" },
  { id: 13, text: "Are the instructions and guidelines on the website clear, helpful, and easy to follow?" },
  { id: 14, text: "Does the website effectively provide access to barangay services without confusion?" },
  { id: 15, text: "Is the process for applying for a KK ID online simple and straightforward to understand?" },
  { id: 16, text: "Is the dashboard after login well-organized, displaying relevant information clearly?" },
  { id: 17, text: "Does the website present all information in a logical and organized manner?" },
  { id: 18, text: "Are the services offered by the website explained clearly, making them easy to use?" },
  { id: 19, text: "Do you feel confident and comfortable while navigating and using the website?" },
  { id: 20, text: "Overall, how satisfied are you with your experience using the SK Tumana website as a resident?" },
];

export function FeedbackModal({ isOpen, onClose, onSubmit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showReview, setShowReview] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal closes
      setCurrentQuestion(0);
      setAnswers({});
      setComment("");
      setName("");
      setEmail("");
      setShowReview(false);
    }
  }, [isOpen]);

  const handleRating = (value) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: parseInt(value)
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleReview = () => {
    setShowReview(true);
  };

  const handleBackToQuestions = () => {
    setShowReview(false);
  };

  const handleSubmit = () => {
    const feedbackData = {
      answers,
      comment,
      name: name || "Anonymous",
      email,
      submittedAt: new Date().toISOString(),
    };
    onSubmit(feedbackData);
    onClose(); // This will trigger the useEffect to reset state
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Check if all questions are answered
  const allQuestionsAnswered = questions.every(q => answers[q.id] !== undefined);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-primary" />
            Website Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve your experience by rating the following aspects of our website.
          </DialogDescription>
        </DialogHeader>

        {!showReview ? (
          <>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-6">
              {/* Question */}
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {currentQuestion + 1}
                  </span>
                  <p className="font-medium">{questions[currentQuestion].text}</p>
                </div>

                {/* Rating options - Always provide a value */}
                <RadioGroup
                  onValueChange={handleRating}
                  value={answers[questions[currentQuestion].id]?.toString() || ""}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                  {ratingScale.map((rating) => (
                    <div key={rating.value}>
                      <RadioGroupItem
                        value={rating.value.toString()}
                        id={`rating-${rating.value}-${currentQuestion}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`rating-${rating.value}-${currentQuestion}`}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Star className={`h-5 w-5 mb-2 ${
                          answers[questions[currentQuestion].id] >= rating.value 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`} />
                        <span className="text-sm font-medium">{rating.label}</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">
                          {rating.description}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                {currentQuestion === questions.length - 1 ? (
                  <Button 
                    onClick={handleReview} 
                    disabled={!answers[questions[currentQuestion].id]}
                  >
                    Review Answers
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext} 
                    disabled={!answers[questions[currentQuestion].id]}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Review section when all questions are answered */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Review Your Answers</h3>
              <Button variant="ghost" size="sm" onClick={handleBackToQuestions}>
                Back to Questions
              </Button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-4">
              {questions.map((q, index) => (
                <div key={q.id} className="text-sm border-b last:border-0 pb-2 last:pb-0">
                  <p className="font-medium">{index + 1}. {q.text}</p>
                  <p className="text-primary mt-1">
                    Rating: {answers[q.id] ? ratingScale.find(r => r.value === answers[q.id])?.label : 'Not rated'}
                  </p>
                </div>
              ))}
            </div>

            {/* Additional comments */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="comment">Additional Comments (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Tell us more about your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name (Optional)</Label>
                  <input
                    type="text"
                    id="name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <input
                    type="email"
                    id="email"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleBackToQuestions}>
                Continue Editing
              </Button>
              <Button onClick={handleSubmit} disabled={!allQuestionsAnswered}>
                Submit Feedback
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}