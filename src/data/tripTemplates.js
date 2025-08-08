// 旅行模板配置（前端内置，可后续迁移到后端）
// 仅预填除目的地外的基础与偏好信息，目的地由 /destinations 选择后携带到 /trip/create

export const tripTemplates = [{
        id: 'weekend-city-3d',
        title: '周末3天 · 城市漫游',
        desc: '轻松微度假，城市走走停停',
        preset: {
            baseForm: { days: 3, budget: 'moderate' },
            preferenceForm: {
                tripGoals: ['relax', 'citywalk'],
                pacePreference: 'balanced',
                focusAreas: ['culture', 'landmark'],
                socialPreference: 'mixed',
                photoPreference: 'casual',
                dietaryRestrictions: [],
                customDietaryNotes: '',
                specialRequirements: ''
            }
        }
    },
    {
        id: 'family-4d',
        title: '亲子 · 4天',
        desc: '亲子友好、节奏适中',
        preset: {
            baseForm: { days: 4, budget: 'moderate' },
            preferenceForm: {
                tripGoals: ['family', 'relax'],
                pacePreference: 'casual',
                focusAreas: ['park', 'museum'],
                socialPreference: 'mixed',
                photoPreference: 'casual',
                dietaryRestrictions: [],
                customDietaryNotes: '',
                specialRequirements: '优先亲子乐园/互动体验'
            }
        }
    },
    {
        id: 'foodie-3d',
        title: '美食 · 3天',
        desc: '在地风味与小众餐厅',
        preset: {
            baseForm: { days: 3, budget: 'moderate' },
            preferenceForm: {
                tripGoals: ['food'],
                pacePreference: 'balanced',
                focusAreas: ['food', 'market'],
                socialPreference: 'mixed',
                photoPreference: 'casual',
                dietaryRestrictions: [],
                customDietaryNotes: '',
                specialRequirements: '避开网红排队店，优先在地口碑餐厅'
            }
        }
    },
    {
        id: 'hiking-5d',
        title: '徒步 · 5天',
        desc: '自然风光与户外徒步',
        preset: {
            baseForm: { days: 5, budget: 'moderate' },
            preferenceForm: {
                tripGoals: ['nature', 'hiking'],
                pacePreference: 'active',
                focusAreas: ['mountain', 'trail', 'viewpoint'],
                socialPreference: 'mixed',
                photoPreference: 'casual',
                dietaryRestrictions: [],
                customDietaryNotes: '',
                specialRequirements: '优先选择难度中等、安全路况'
            }
        }
    },
    {
        id: 'budget-3d',
        title: '省钱 · 3天',
        desc: '公共交通+高性价比餐饮',
        preset: {
            baseForm: { days: 3, budget: 'economy' },
            preferenceForm: {
                tripGoals: ['save'],
                pacePreference: 'balanced',
                focusAreas: ['free', 'park'],
                socialPreference: 'mixed',
                photoPreference: 'minimal',
                dietaryRestrictions: [],
                customDietaryNotes: '',
                specialRequirements: '优先步行/地铁路线，门票开销尽量低'
            }
        }
    }
]

export function findTemplateById(id) {
    return tripTemplates.find(t => t.id === id)
}