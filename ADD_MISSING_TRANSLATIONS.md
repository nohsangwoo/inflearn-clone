# 누락된 번역 추가 방법

## 문제
vi, ru, zh, zh-CN, zh-TW, fr, de, es, pt, it, id, th, hi, ar, tr, pl, uk 언어에
login, dashboard, course 섹션이 누락됨

## 해결 방법

각 언어 섹션의 company 다음에 아래 내용 추가:

```typescript
    login: {
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
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Recent activity and learning progress',
      stats: {
        coursesInProgress: 'Courses in Progress',
        weeklyHours: 'Weekly Hours',
        likes: 'Likes',
      },
    },
    course: {
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
    },
```

## 적용 대상 언어
- vi (베트남어) - 761줄
- ru (러시아어) - 882줄
- zh (중국어 간체)
- zh-CN (중국어 간체-중국)
- zh-TW (중국어 번체-대만)
- fr (프랑스어)
- de (독일어)
- es (스페인어)
- pt (포르투갈어)
- it (이탈리아어)
- id (인도네시아어)
- th (태국어)
- hi (힌디어)
- ar (아랍어)
- tr (터키어)
- pl (폴란드어)
- uk (우크라이나어)