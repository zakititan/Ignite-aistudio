import type { BusinessProfile, CustomerJourneyType } from "./types";

export interface JourneyDefinition {
  type: CustomerJourneyType;
  label: string;
  description: string;
  steps: string[];
}

export const JOURNEY_DEFINITIONS: Record<CustomerJourneyType, JourneyDefinition> = {
  phone_call: {
    type: "phone_call",
    label: "Phone call",
    description: "Customer finds your number and calls you.",
    steps: [
      "Find your phone number on the website using a phone — not a computer",
      "Tap the number and see if your phone offers to call",
      "Call and check that someone answers or you hear the expected voicemail",
      "Say who you are and that this is a test, and confirm they heard you clearly",
      "Check the call appears in your business call log if you track enquiries",
      "Note how long it took to connect and whether it felt easy",
    ],
  },
  whatsapp_message: {
    type: "whatsapp_message",
    label: "WhatsApp message",
    description: "Customer taps a WhatsApp button to message you.",
    steps: [
      "Find the WhatsApp button or number on your website on a phone",
      "Tap it and see if WhatsApp opens with a message ready to send",
      "Check the pre-filled message is friendly and makes sense",
      "Send a test message from a personal number",
      "Confirm the message arrives on the business phone or WhatsApp app",
      "Reply and confirm the customer would get a timely, clear response",
    ],
  },
  contact_form: {
    type: "contact_form",
    label: "Contact form",
    description: "Customer fills in a form and waits for a reply.",
    steps: [
      "Find the contact form on your website on a phone",
      "Check that required fields are clearly marked and easy to fill",
      "Fill in the form with a test message using your personal email",
      "Submit the form and look for a clear thank-you or confirmation on screen",
      "Check the message arrives in the right inbox — and not in spam",
      "Reply to the test message and confirm the reply reaches the customer inbox",
    ],
  },
  booking: {
    type: "booking",
    label: "Booking or appointment",
    description: "Customer books a time or service online.",
    steps: [
      "Find how to book on your website on a phone",
      "Choose a service, date and time that should be available",
      "Fill in your details and any required questions",
      "Confirm the booking and look for a clear confirmation on screen",
      "Check that a confirmation email or message arrives promptly",
      "Try to change or cancel the test booking to see if that works",
    ],
  },
  online_purchase: {
    type: "online_purchase",
    label: "Online purchase",
    description: "Customer adds to cart and checks out.",
    steps: [
      "Find a product and open its page on a phone",
      "Check price, delivery cost and returns information is clear",
      "Add the item to your basket or cart",
      "Go to checkout and fill in address and payment details — use test mode if available",
      "Complete the purchase and look for a clear order confirmation on screen",
      "Check that confirmation email arrives and your order count updates",
    ],
  },
  visit_location: {
    type: "visit_location",
    label: "Visit in person",
    description: "Customer finds your address and visits.",
    steps: [
      "Find your address, map and opening hours on the website on a phone",
      "Tap the address and see if maps opens with the correct location",
      "Check directions and parking or transport help is clear",
      "Check photos and signage match what a first-time visitor will see",
      "Visit at opening time and confirm hours and entry instructions are correct",
      "Ask a friend to follow the website directions and note where they hesitate",
    ],
  },
  newsletter_signup: {
    type: "newsletter_signup",
    label: "Newsletter signup",
    description: "Customer signs up for updates by email.",
    steps: [
      "Find the newsletter signup on your website on a phone",
      "Check what signing up gives and how often you will email",
      "Enter your personal email and submit",
      "Look for a clear confirmation on screen after signing up",
      "Check a welcome or confirmation email arrives — and not in spam",
      "Open the email and check the unsubscribe or preferences link works",
    ],
  },
  custom: {
    type: "custom",
    label: "Custom journey",
    description: "Test any other single action you want customers to take.",
    steps: [
      "Find the first step of the action you want customers to take",
      "Check the information or form on that page is clear and complete",
      "Complete the action as a real customer would on a phone",
      "Look for confirmation that the action succeeded",
      "Check you receive the expected notification or record",
      "Ask a friend to try without help and note where they hesitate",
    ],
  },
};

export function getJourneySteps(type: CustomerJourneyType, customLabel?: string): string[] {
  const def = JOURNEY_DEFINITIONS[type];
  if (type === "custom" && customLabel?.trim()) {
    return def.steps;
  }
  return def.steps;
}

export function inferDefaultJourney(business: BusinessProfile): CustomerJourneyType {
  // Phase 4: business profile explicit action takes precedence
  const explicit = (business.primaryCustomerAction ?? "").trim() as CustomerJourneyType;
  if (explicit && JOURNEY_DEFINITIONS[explicit]) return explicit;

  const needs = business.needs ?? [];
  const goal = (business.primaryGoal ?? "").toLowerCase();
  const has = (n: string) => needs.includes(n);

  if (has("Online booking") || goal.includes("booking") || goal.includes("appointment"))
    return "booking";
  if (has("Ecommerce shop") || goal.includes("sell") || goal.includes("product"))
    return "online_purchase";
  if (
    has("Email newsletter signup") ||
    goal.includes("newsletter") ||
    goal.includes("collect leads")
  )
    return "newsletter_signup";
  if (has("WhatsApp / phone contact button")) {
    // Prefer whatsapp if explicitly, else phone
    return "whatsapp_message";
  }
  if (
    has("Contact form") ||
    goal.includes("enquir") ||
    goal.includes("lead") ||
    goal.includes("contact")
  )
    return "contact_form";
  if (
    business.hasPhysicalLocation ||
    business.customerModel === "local" ||
    goal.includes("visit") ||
    goal.includes("local")
  ) {
    return "visit_location";
  }
  if (goal.includes("phone") || goal.includes("call")) return "phone_call";
  return "contact_form";
}

export function journeyLabel(type: CustomerJourneyType, customLabel?: string): string {
  if (type === "custom" && customLabel?.trim()) return customLabel.trim();
  return JOURNEY_DEFINITIONS[type].label;
}
