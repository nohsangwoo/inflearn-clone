// Helper to provide default translations for missing sections
// This ensures TypeScript type safety while we gradually add proper translations

const defaultLoginTranslation = {
  title: 'Login',
  subtitle: 'Choose one of the methods below to continue',
  continueWith: 'Continue with',
  google: 'Continue with Google',
  apple: 'Continue with Apple',
  or: 'or',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  emailPlaceholder: 'you@example.com',
  passwordPlaceholder: '********',
  login: 'Login',
  signup: 'Sign Up',
  loginButton: 'Login with Email',
  signupButton: 'Sign Up with Email',
  loggingIn: 'Logging in...',
  signingUp: 'Signing up...',
  noAccount: "Don't have an account? Sign up",
  hasAccount: 'Already have an account? Login',
  agreement: 'By logging in, you agree to our Terms of Service and Privacy Policy.',
  errors: {
    required: 'Please enter email and password',
    invalidEmail: 'Invalid email format',
    passwordLength: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
    loginFailed: 'Login failed',
    signupFailed: 'Sign up failed',
    socialLoginFailed: 'Social login failed',
  },
  success: {
    login: 'Login successful',
    signup: 'Sign up complete',
    emailVerification: 'Verification email sent. Please check your inbox.',
  },
};

const defaultDashboardTranslation = {
  title: 'Dashboard',
  subtitle: 'Recent activity and learning progress',
  stats: {
    coursesInProgress: 'Courses in Progress',
    weeklyHours: 'Weekly Hours',
    likes: 'Likes',
  },
};

const defaultCourseTranslation = {
  students: 'students',
  curriculum: 'Curriculum',
  noCurriculum: 'No curriculum yet.',
  reviews: 'Reviews',
  noReviews: 'No reviews yet.',
  writeReview: 'Write Review',
  reviewPlaceholder: 'Leave your course review',
  sendWithCtrlEnter: 'Send with Ctrl+Enter',
  reply: 'Reply',
  replyPlaceholder: 'Write a reply',
  private: 'Private',
  free: 'Free',
  originalPrice: 'Original Price',
  enroll: 'Enroll',
  addToCart: 'Add to Cart',
  inCart: 'In Cart',
  startLearning: 'Start Learning',
  peoplesLikes: 'people like this',
  loading: 'Loading...',
};

// Helper function to fill missing translations
export function fillMissingTranslations(translation: Record<string, unknown>) {
  return {
    ...translation,
    login: translation.login || defaultLoginTranslation,
    dashboard: translation.dashboard || defaultDashboardTranslation,
    course: translation.course || defaultCourseTranslation,
  };
}