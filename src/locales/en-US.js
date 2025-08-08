export default {
    // Common
    common: {
        confirm: 'Confirm',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        loading: 'Loading...',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        reset: 'Reset',
        close: 'Close',
        yes: 'Yes',
        no: 'No',
        required: 'Required',
        optional: 'Optional'
    },

    // Navigation and Menu
    nav: {
        home: 'Home',
        trips: 'Trips',
        discover: 'Discover',
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout'
    },

    // User Authentication
    auth: {
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        verificationCode: 'Verification Code',
        sendCode: 'Send Code',
        resendIn: 'Resend in {s}s',
        loggingIn: 'Logging in...',
        registering: 'Registering...',
        otherLoginMethods: 'Other login methods',
        otherRegisterMethods: 'Other registration methods',
        nickname: 'Nickname',
        welcome: 'Welcome Back',
        welcomeBack: 'Welcome back, {name}!',
        loginSuccess: 'Login successful',
        registerSuccess: 'Registration successful',
        codeResent: 'Verification code resent',
        agreementText: 'By logging in, you agree to our',
        userAgreement: 'Terms of Service',
        privacyPolicy: 'Privacy Policy',
        forgotPassword: 'Forgot password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        goToRegister: 'Sign up now',
        goToLogin: 'Sign in now'
    },

    // Brand Information
    brand: {
        name: 'GoingTour',
        tagline: 'Personalized Travel Planning Assistant',
        features: {
            smartPlanning: {
                title: 'Smart Itinerary Planning',
                desc: 'AI-driven personalized travel route recommendations'
            },
            dataAnalysis: {
                title: 'Data Analysis Optimization',
                desc: 'Precise attraction matching based on user preferences'
            },
            tripSharing: {
                title: 'Trip Sharing & Collaboration',
                desc: 'Real-time sharing and collaborative planning with friends'
            }
        },
        copyright: '© 2024 GoingTour. Making every journey full of surprises'
    },

    // Account Settings
    settings: {
        accountSettings: 'Account Settings',
        profileSettings: 'Profile',
        securitySettings: 'Security',
        privacySettings: 'Privacy',
        systemSettings: 'System',
        nickname: 'Nickname',
        avatar: 'Avatar',
        email: 'Email',
        phone: 'Phone',
        joinDate: 'Join Date',
        updateProfile: 'Update Profile',
        emailLogin: 'Email Verification Login',
        passwordLogin: 'Password Login',
        setPassword: 'Set Password',
        changePassword: 'Change Password',
        clearPassword: 'Clear Password',
        loginHistory: 'Login History',
        language: 'Language',
        theme: 'Theme',
        notifications: 'Notifications',
        preferences: 'Preferences',
        exportData: 'Export Data',
        deleteAccount: 'Delete Account',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        systemMode: 'Follow System'
    },

    // Personal (Profile) Page
    personal: {
        userDefault: 'User',
        quickActions: 'Quick Actions',
        createTripDesc: 'Start planning your next journey',
        preferencesDesc: 'Personalize your travel recommendations',
        myTrips: 'My Trips',
        createNewTrip: 'Create New Trip',
        aiGenerated: 'AI Generated',
        status: {
            draft: 'Draft',
            completed: 'Completed'
        },
        daysSuffix: ' days',
        travelersSuffix: ' ppl',
        noTrips: 'No trips created yet',
        createNow: 'Create now',
        myPreferences: 'My Preferences',
        editPreferences: 'Edit Preferences',
        card: {
            travelTypes: 'Travel Types',
            dailyBudget: 'Daily Budget',
            mbti: 'MBTI Personality',
            transport: 'Transportation',
            accommodation: 'Accommodation',
            diet: 'Diet Preferences',
            taste: 'Taste',
            restrictions: 'Restrictions',
            activityTime: 'Activity Time',
            travelPace: 'Travel Pace',
            others: 'Other Preferences'
        },
        perDay: ' / day',
        noPreferences: 'No preferences set yet',
        setNow: 'Set now',
        myTripsDesc: 'View and manage your trip history',
        accountSettingsDesc: 'Security and privacy settings',
        joinedAt: 'Joined {date}',
        noPhone: 'No phone linked',
        stats: {
            createdTrips: 'Trips created',
            preferenceTags: 'Preference tags',
            usageDays: 'Usage days'
        },
        messages: {
            avatarUpdateSuccess: 'Avatar updated successfully!',
            avatarUpdateFail: 'Failed to update avatar, please try again',
            notLoggedIn: 'User not logged in',
            tripDeleteSuccess: 'Trip deleted successfully',
            tripDeleteFail: 'Failed to delete trip, please try again',
            navigationFail: 'Navigation failed, please try again'
        },
        dialog: {
            deleteTripTitle: 'Delete Trip',
            deleteTripMessage: 'Are you sure you want to delete this trip? This action cannot be undone.'
        }
    },

    // Trip Related
    trip: {
        createTrip: 'Create Trip',
        editTrip: 'Edit Trip',
        tripDetails: 'Trip Details',
        destination: 'Destination',
        startDate: 'Start Date',
        endDate: 'End Date',
        budget: 'Budget',
        travelers: 'Travelers',
        preferences: 'Preferences',
        aiGeneration: 'AI Generation',
        generationStyle: 'Generation Style',
        generateTrip: 'Generate Trip',
        cancelGeneration: 'Cancel Generation',
        generating: 'Generating trip...',
        backToList: 'Back to trip list',
        saveChanges: 'Save Changes',
        share: 'Share',
        export: 'Export',
        more: 'More',
        duplicate: 'Duplicate',
        saveAsTemplate: 'Save as Template',
        deleteTrip: 'Delete Trip',
        createdAt: 'Created at {date}',
        dailySchedule: 'Daily Schedule',
        dayN: 'Day {n}',
        activitiesCount: '{count} activities',
        tripTime: 'Trip Time',
        budgetRange: 'Budget Range',
        estimatedCost: 'Estimated Cost',
        contentStats: 'Content Stats',
        attractionCount: '{count} attractions',
        restaurantCount: '{count} restaurants',
        activityTypes: {
            attraction: 'Attraction',
            restaurant: 'Restaurant',
            transport: 'Transport',
            hotel: 'Hotel',
            other: 'Other'
        },
        intensity: 'Trip Intensity',
        specialExperiences: 'Special Experiences',
        transportPreferences: 'Transport Preferences',
        specialRequests: 'Special Requests',
        backToProfile: 'Back to Profile',
        previewMode: 'Preview Mode',
        editMode: 'Edit Mode',
        markdownEdit: 'Markdown Edit',
        contentPlaceholder: 'Please enter trip content (Markdown supported)',
        inputTitle: 'Please enter trip title',
        daysLabel: 'Days',
        travelersLabel: 'Travelers',
        qualityScore: 'Quality',
        durationLabel: 'Duration',
        budgetSettings: 'Budget Settings',
        totalBudget: 'Total Budget',
        budgetPlaceholder: 'Budget amount',
        yuan: 'CNY',
        noTripData: 'No trip data found',
        saveTrip: 'Save Trip',
        styles: {
            table: 'Table',
            narrative: 'Narrative',
            card: 'Card',
            checklist: 'Checklist'
        },
        styleDescriptions: {
            table: 'Clear schedule',
            narrative: 'Rich details',
            card: 'Modern layout',
            checklist: 'Easy to follow'
        }
    },

    // Trip Share Page
    share: {
        title: 'Trip Sharing',
        subtitle: 'Share your amazing travel plan',
        comingTitle: 'Trip sharing is under development',
        comingDesc: 'We are working hard to improve the sharing features, including:',
        features: {
            poster: 'Trip poster generation',
            qr: 'QR code sharing',
            social: 'Social media sharing',
            link: 'Link sharing'
        },
        stayTuned: 'Stay tuned!'
    },

    // Data/Search placeholders
    dataSearch: {
        title: 'Search Results',
        subtitle: 'Find attractions and destinations you like',
        comingTitle: 'Search is under development',
        comingDesc: 'We are working hard to improve the search features, including:',
        features: {
            attraction: 'Attraction search',
            city: 'City search',
            smart: 'Smart recommendations',
            filter: 'Filtering',
            history: 'Search history'
        },
        stayTuned: 'Stay tuned!'
    },

    attraction: {
        title: 'Attraction Details',
        subtitle: 'View details and add to your trip',
        comingTitle: 'Attraction details are under development',
        comingDesc: 'We are working hard to improve the attraction details, including:',
        features: {
            intro: 'Detailed introduction',
            hours: 'Opening hours',
            ticket: 'Ticket price',
            reviews: 'User reviews',
            add: 'Add to trip'
        },
        stayTuned: 'Stay tuned!'
    },

    restaurant: {
        title: 'Restaurant List',
        subtitle: 'Discover nearby delicacies and enrich your trip',
        comingTitle: 'Restaurant list is under development',
        comingDesc: 'We are working hard to improve the restaurant features, including:',
        features: {
            nearby: 'Nearby restaurants',
            price: 'Sort by price',
            distance: 'Distance filter',
            cuisine: 'Cuisine categories',
            reviews: 'User reviews'
        },
        stayTuned: 'Stay tuned!'
    },

    // Destinations Page
    destinations: {
        title: 'Where to go',
        searchPlaceholder: 'Search cities, regions...',
        searchResults: 'Search Results',
        noMatch: 'No matching cities found. Try another keyword.',
        hotCities: 'Hot Cities',
        hot: 'Hot',
        jumpTo: 'Jump to {letter}'
    },

    // Form Validation
    validation: {
        required: '{field} is required',
        email: 'Please enter a valid email address',
        minLength: '{field} must be at least {min} characters',
        maxLength: '{field} cannot exceed {max} characters',
        passwordMismatch: 'Passwords do not match',
        codeFormat: 'Verification code must be 6 digits'
    },

    // Messages
    messages: {
        confirmLogout: 'Are you sure you want to log out?',
        unsavedTitle: 'Unsaved Changes',
        unsavedMessage: 'You have unsaved changes. Leave this page?',
        leave: 'Leave',
        stay: 'Continue editing',
        updateSuccess: 'Update successful',
        updateFailed: 'Update failed',
        deleteSuccess: 'Delete successful',
        deleteFailed: 'Delete failed',
        operationSuccess: 'Operation successful',
        operationFailed: 'Operation failed',
        networkError: 'Network error, please try again',
        serverError: 'Server error',
        unauthorized: 'Unauthorized access',
        forbidden: 'Access denied'
    }
}