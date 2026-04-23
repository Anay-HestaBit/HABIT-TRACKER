const habitPacks = [
  {
    id: 'morning-boost',
    name: 'Morning Boost',
    description: 'Start the day with energy, clarity, and momentum.',
    tags: ['morning', 'energy', 'focus'],
    habits: [
      {
        name: 'Drink water (500ml)',
        description: 'Rehydrate first thing after waking up.',
        frequency: 'daily',
        color: '#3b82f6',
        icon: 'Droplets',
      },
      {
        name: '10-minute stretch',
        description: 'Loosen up and wake the body gently.',
        frequency: 'daily',
        color: '#22c55e',
        icon: 'Activity',
      },
      {
        name: 'Plan the day',
        description: 'Write 3 priorities and 1 small win.',
        frequency: 'daily',
        color: '#f59e0b',
        icon: 'ListChecks',
      },
    ],
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus Sprint',
    description: 'Build a daily focus ritual that compounds.',
    tags: ['work', 'focus', 'study'],
    habits: [
      {
        name: 'One deep work block',
        description: '45 minutes of uninterrupted focus.',
        frequency: 'daily',
        color: '#8b5cf6',
        icon: 'Target',
      },
      {
        name: 'No phone for 1 hour',
        description: 'Remove interruptions during your best hour.',
        frequency: 'daily',
        color: '#ef4444',
        icon: 'ShieldOff',
      },
      {
        name: 'Review tomorrow',
        description: 'Decide the first task for tomorrow.',
        frequency: 'daily',
        color: '#06b6d4',
        icon: 'CalendarCheck',
      },
    ],
  },
  {
    id: 'evening-reset',
    name: 'Evening Reset',
    description: 'Wind down with calm habits that improve sleep.',
    tags: ['evening', 'sleep', 'calm'],
    habits: [
      {
        name: 'No screens 30 min before bed',
        description: 'Protect your sleep cycle.',
        frequency: 'daily',
        color: '#6366f1',
        icon: 'Moon',
      },
      {
        name: 'Gratitude note',
        description: 'Write one thing you are grateful for.',
        frequency: 'daily',
        color: '#14b8a6',
        icon: 'Heart',
      },
      {
        name: 'Prepare tomorrow',
        description: 'Set out clothes or plan a small win.',
        frequency: 'daily',
        color: '#f97316',
        icon: 'Sparkles',
      },
    ],
  },
];

module.exports = { habitPacks };
