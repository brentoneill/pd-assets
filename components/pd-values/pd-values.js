'use strict';

angular.module('pdValues', [])
    .value('weekdays', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])

    /* TODO: delete months2 and fix marketplace selectize dropdowns */
    /* Months options for dropdown on DOB fields */
    .value('months', [
        { name: 'January', val: 0 },
        { name: 'February', val: 1 },
        { name: 'March', val: 2 },
        { name: 'April', val: 3 },
        { name: 'May', val: 4 },
        { name: 'June', val: 5 },
        { name: 'July', val: 6 },
        { name: 'August', val: 7 },
        { name: 'September', val: 8 },
        { name: 'October', val: 9 },
        { name: 'November', val: 10 },
        { name: 'December', val: 11 }
    ])

    .value('months2', [
        { name: 'January', val: 1 },
        { name: 'February', val: 2 },
        { name: 'March', val: 3 },
        { name: 'April', val: 4 },
        { name: 'May', val: 5 },
        { name: 'June', val: 6 },
        { name: 'July', val: 7 },
        { name: 'August', val: 8 },
        { name: 'September', val: 9 },
        { name: 'October', val: 10 },
        { name: 'November', val: 11 },
        { name: 'December', val: 12 }
    ])

    /* Days of the month options for dropdown on DOB fields */
    .value('monthDays', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31])

    /* The state options available in state dropdowns */
    .value('states', {
        'AL': 'Alabama',
        'AK': 'Alaska',
        'AZ': 'Arizona',
        'AR': 'Arkansas',
        'CA': 'California',
        'CO': 'Colorado',
        'CT': 'Connecticut',
        'DE': 'Delaware',
        'FL': 'Florida',
        'GA': 'Georgia',
        'HI': 'Hawaii',
        'ID': 'Idaho',
        'IL': 'Illinois',
        'IN': 'Indiana',
        'IA': 'Iowa',
        'KS': 'Kansas',
        'KY': 'Kentucky',
        'LA': 'Louisiana',
        'ME': 'Maine',
        'MD': 'Maryland',
        'MA': 'Massachusetts',
        'MI': 'Michigan',
        'MN': 'Minnesota',
        'MS': 'Mississippi',
        'MO': 'Missouri',
        'MT': 'Montana',
        'NE': 'Nebraska',
        'NV': 'Nevada',
        'NH': 'New Hampshire',
        'NJ': 'New Jersey',
        'NM': 'New Mexico',
        'NY': 'New York',
        'NC': 'North Carolina',
        'ND': 'North Dakota',
        'OH': 'Ohio',
        'OK': 'Oklahoma',
        'OR': 'Oregon',
        'PA': 'Pennsylvania',
        'RI': 'Rhode Island',
        'SC': 'South Carolina',
        'SD': 'South Dakota',
        'TN': 'Tennessee',
        'TX': 'Texas',
        'UT': 'Utah',
        'VT': 'Vermont',
        'VA': 'Virginia',
        'WA': 'Washington',
        'WV': 'West Virginia',
        'WI': 'Wisconsin',
        'WY': 'Wyoming'
    })
    .value('transactions', [
        { name: 'Authorizations', val: 'authorizations' },
        { name: 'Eligibility', val: 'eligibility' },
        { name: 'Claim Status', val: 'claim_status' },
        { name: 'Claim Submission', val: 'claims' },
        { name: 'Referrals', val: 'referrals' }
    ])
    .value('searchParams', {
        searchData: {
            location: 'CHARLESTON SC',
            specialty: 'Retina Imaging',
            distance: '15mi',
            gender: 'all',
            sortBy: 'Match'
        },
        // appointment date select controls
        dateOffset: 0,

        distances: [{
            value: 'any',
            label: 'Any Distance'
        }, {
            value: '15',
            label: '15mi'
        }, {
            value: '30',
            label: '30mi'
        }, {
            value: '45',
            label: '45mi'
        }],

        genders: [{
            value: 'female',
            label: 'Female'
        }, {
            value: 'male',
            label: 'Male'
        }, {
            value: null,
            label: 'All Genders'
        }],

        sortOptions: [{
            value: 'match',
            label: 'Sort by Match'
        }, {
            value: 'distance',
            label: 'Sorty by Distance'
        }]
    });
