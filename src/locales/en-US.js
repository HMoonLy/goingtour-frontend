export default {
    route: {
        login: "Login",
        register: "Register",
        personal: "Personal Center",
        home: "Home",
        accountSettings: "Account Settings",
        preferences: "Preferences",
        destinations: "Choose Destination",
        tripCreate: "Create Trip",
        tripDetail: "Trip Detail",
        aiTripEdit: "Edit AI Trip",
        attractionDetail: "Attraction Detail",
        restaurantList: "Restaurant List",
        search: "Search Results",
        tripShare: "Trip Share",
        notFound: "Page Not Found"
    },
    // Common
    common: {
        confirm: 'Confirm',
        cancel: 'Cancel',
        confirmRemove: 'Are you sure to remove this item?',
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
        optional: 'Optional',
        selected: 'Selected',
        to: 'to',
        startDate: 'Start Date',
        endDate: 'End Date',
        dateFormatYMD: 'YYYY-MM-DD',
        weekdayPrefix: 'Week ',
        none: 'None'
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
        systemMode: 'Follow System',
        clearAllRecords: 'Clear all records',
        noLoginRecords: 'No login records',
        loginTime: 'Login Time',
        status: 'Status',
        loginMethod: 'Login Method',
        ipAddress: 'IP Address',
        location: 'Location',
        deviceType: 'Device Type',
        browser: 'Browser',
        operatingSystem: 'Operating System',
        sessionDuration: 'Session Duration'
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
        perDaySuffix: 'per person/day',
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
        baseInfo: {
            title: 'Trip Basic Information',
            subtitle: 'Complete your plan and we will tailor a trip for you'
        },
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
        add: 'Add to plan',
        added: 'Added',
        viewDetails: 'View Trip Details',
        generated: 'Trip generated successfully!',
        prepareGenerate: 'Get ready to generate your exclusive trip',
        prepareGenerateDesc: 'Based on your preferences and requirements, AI will plan the route for you',
        fillBasicInfo: 'Please fill in basic information (destination, days, dates, etc.)',
        personalPreferences: 'Personal Preferences',
        noUserPreferences: 'No preferences set. Go to Profile > Preferences to set up',
        thisTripPreferences: 'Preferences for This Trip',
        setPreferencesInStep: 'Please set preferences in the "Personalized Preferences" step',
        dietaryRestrictions: 'Dietary Restrictions',
        weatherSuggestion: 'Weather Suggestions',
        weatherForecast: 'Weather Forecast',
        daysAutoByDate: 'Auto-calc by date range',
        daysAutoTip: 'Days will be calculated from the selected date range',
        selectedDateRange: 'Selected date range',
        selectDateRangeTip: 'Please select the date range of your trip',
        travelersTip: 'Traveler count affects restaurant and hotel recommendations',
        mustSee: 'Must-see Attractions',
        noMustSeeSelected: 'No must-see attractions selected. Add from recommended list',
        mustEat: 'Must-eat Restaurants',
        noMustEatSelected: 'No must-eat restaurants selected. Add from recommended list',
        generation: {
            format: 'Format',
            styles: {
                table: 'Table',
                narrative: 'Narrative',
                card: 'Card',
                checklist: 'Checklist'
            },
            styleDesc: {
                table: 'Clear timeline',
                narrative: 'Vivid details',
                card: 'Modern and beautiful',
                checklist: 'Easy to execute'
            }
        },
        actions: {
            viewFullPrompt: 'View Full Prompt',
            generateUsingPrompt: 'Generate with this prompt',
            generating: 'Generating...',
            copy: 'Copy Trip',
            regenerate: 'Regenerate'
        },
        aiPrompt: {
            preview: 'AI Prompt Preview',
            viewFull: 'View full prompt'
        },
        dialog: {
            fullPromptTitle: 'Full AI Prompt',
            copyPrompt: 'Copy Prompt',
            close: 'Close',
            copyAndClose: 'Copy & Close',
            regenerateTitle: 'Confirm Regenerate',
            regenerateMessage: 'Regenerating will overwrite the current trip. Continue?'
        },
        messages: {
            fullPromptReady: 'Full prompt generated. You can copy it to test in AI tools',
            copySuccess: 'Copied to clipboard!',
            copyFailed: 'Copy failed, please copy manually',
            cancelling: 'Cancelling generation...',
            cancelled: 'Generation cancelled'
        },
        warnings: {
            completeBasicInfo: 'Please complete the basic information first'
        },
        progress: {
            start: '🚀 Starting AI trip planner...',
            analyzingPrefs: '📊 Analyzing your preferences...',
            buildPrompt: '📝 Building your tailored prompt...',
            connectAi: '🤖 Connecting to AI service...',
            deepAnalyze: '🧠 AI is deeply analyzing your needs...',
            sending: '🌐 Sending request to AI server...',
            generating: '⚡ AI is generating your trip...',
            formatting: '📋 Formatting trip content...'
        },
        errors: {
            generateFailed: 'Generation failed',
            generateFailedRetry: 'Generation failed, please try again later',
            timeout: 'AI service timed out, please try again',
            paymentRequired: 'AI service balance is insufficient. Please contact admin',
            network: 'Network error, please retry',
            withMessage: 'Error:'
        },
        generating: {
            aiWorking: 'AI is carefully planning your trip...',
            timeRemaining: 'About {s}s remaining'
        },
        recommendedCounts: 'Recommended {attractions} attractions and {restaurants} restaurants',
        weather: {
            amapApi: 'Amap Weather API',
            noticeTitle: 'Weather Notice',
            outOfRangeAdvice: 'For dates beyond the forecast, please watch local real-time weather and prepare flexible clothes.',
            noAccurateForecast: 'Selected dates are out of the current forecast range, accurate forecast is unavailable.',
            checkBeforeTravel: 'Please check the destination weather before departure.',
            suitableActivitiesPrefix: 'Suitable for ',
            suitableActivitiesSuffix: ' and other activities.',
            tips: 'Tips: ',
            cautions: 'Cautions: ',
            detail: 'Forecast Details',
            partialForecastPrefix: 'Available forecast (first ',
            daysSuffix: ' days)',
            referenceForecast: 'Reference Forecast',
            historicalSim: 'Simulated from historical data',
            amapApiForecast: 'Amap API forecast',
            dateOutOfRange: 'Date out of forecast range',
            afterDayNeedsAttention: 'From day {day} and onward, please check real-time weather',
            loading: 'Fetching weather...',
            fetchFailedPrefix: 'Failed to fetch weather:',
            outOfRangeWithDate: 'Selected date range ({date}) is out of forecast range, the info below is for reference',
            forecastInsufficient: 'Your trip has {days} days but the forecast only has {forecastDays} days',
            windLevel: ' level',
            tempRange: 'Temperature Range',
            forecastDays: 'Forecast Days',
            dataSource: 'Data Source',
            travelTips: 'Travel Tips'
        },
        noAlternativeAttractions: 'No other attractions to replace',
        noAlternativeRestaurants: 'No other restaurants to replace',
        noAttractionsToAdd: 'No attractions available to add',
        noRestaurantsToAdd: 'No restaurants available to add',
        aiDisplay: {
            titleSuffix: ' Trip Plan',
            subtitle: 'AI-tailored {days}-day trip in {city}',
            feedbackTitle: 'Trip Feedback',
            overallSatisfaction: 'Overall satisfaction:',
            rating: {
                veryBad: 'Very Bad',
                bad: 'Bad',
                ok: 'OK',
                good: 'Good',
                excellent: 'Excellent'
            },
            feedbackPlaceholder: 'Any suggestions or thoughts about this trip? (optional)',
            submitFeedback: 'Submit Feedback',
            thanksRating: 'Thanks for your {n}-star rating!'
        },
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
        },
        promptQuality: {
            high: 'High completeness',
            medium: 'Basically complete',
            low: 'Needs improvement'
        }
    },

    // Lightweight search translations used in TripPreferences
    search: {
        attractionPlaceholder: 'Search attraction name, type...',
        restaurantPlaceholder: 'Search restaurant name, cuisine...',
        sortBy: 'Sort by',
        sort: { default: 'Default', rating: 'Highest Rating', distance: 'Nearest' },
        resultsFor: "Results for '{keyword}' ({count} attractions)",
        resultsForRestaurant: "Results for '{keyword}' ({count} restaurants)",
        backToRecommend: 'Back to recommendations',
        noAttraction: 'No recommended attractions for now',
        noRestaurant: 'No recommended restaurants for now',
        noAddress: 'No address info',
        viewMoreAttraction: 'View more attractions',
        viewMoreRestaurant: 'View more restaurants',
        foundCount: 'Found {count} results',
        noResults: 'No related results, try another keyword',
        enterKeyword: 'Please enter a keyword',
        recommendationFor: 'Recommended in {city}'
    },

    // Preferences mini labels used inside TripPreferences
    preferences: {
        smartPrefilled: 'Smart suggestions prefilled',
        recommendedCount: 'Recommended {count} items',
        pace: { title: 'Pace Preference', desc: 'Choose a pace that fits your time and depth of experience' },
        social: { title: 'Social Environment', desc: 'Choose the environment and vibe you prefer' },
        photo: {
            title: 'Photo Taking',
            desc: 'Tell us how much you value photo taking and sharing',
            must: 'Must-have',
            mustDesc: 'Popular photo spots first',
            casual: 'Casual',
            casualDesc: 'Natural scenery is fine',
            minimal: 'Not important',
            minimalDesc: 'Experience first'
        },
        dietary: {
            desc: 'Let us know your dietary restrictions to recommend proper restaurants',
            placeholder: 'Other dietary restrictions or special needs, e.g., religious taboos, allergens, etc.'
        },
        special: {
            desc: 'Tell us any special conditions to consider',
            placeholder: 'e.g., limited mobility, with kids, with pets, accessibility required, etc.'
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
            reviews: 'User reviews',
            recommended: 'Signature dishes'
        },
        stayTuned: 'Stay tuned!',
        perCapita: 'Per capita: ¥{price}'
    },

    // Common category labels
    category: {
        scenic: 'Scenic Spot',
        catering: 'Catering Service'
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