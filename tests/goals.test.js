import { getGoalReport } from '../src/features/goals/goal.controller.js';

import GoalModel from '../src/shared/models/goal.model.js';
import CourseModel from '../src/shared/models/course.model.js';
import EventModel from '../src/shared/models/event.model.js';

jest.mock('../src/shared/models/goal.model.js');
jest.mock('../src/shared/models/course.model.js');
jest.mock('../src/shared/models/event.model.js');

const Goal = GoalModel;
const Course = CourseModel;
const Event = EventModel;

const USER_ID = 'dev';
const GOAL_ID = '64e000000000000000000000';
const COURSE_ID = '64e111111111111111111111';

function setupGoal(targetGrade = 80) {
  Goal.findOne.mockResolvedValue({
    _id: GOAL_ID,
    userId: USER_ID,
    courseId: COURSE_ID,
    targetGrade,
  });
}
function setupCourse() {
  Course.findById.mockResolvedValue({
    _id: COURSE_ID,
    code: 'IPC144',
    title: 'Intro to Programming',
  });
}
function setupEvents(past, future) {
  // Mock the chain: Event.find().lean() returns [...past, ...future]
  Event.find.mockReturnValue({
    lean: jest.fn().mockResolvedValue([...past, ...future])
  });
}

describe('Get Goal Report – feasibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupCourse();
  });

  it('returns ON_TRACK when goal is still achievable', async () => {
    setupGoal(80); // target grade
    // Past: 10% weight, grade 70
    // Future: 90% weight (no grades yet) -> need 82 to hit target
    setupEvents(
      [{ grade: 70, weight: 10 }],   // past
      [{ grade: null, weight: 90 }], // future
    );

    const result = await getGoalReport(USER_ID, GOAL_ID);
    expect(result.success).toBe(true);
    expect(result.report.achievable).toBe(true);
    expect(result.report.recommendation).toBe('ON_TRACK');
    expect(result.report.requiredAvgForRemaining).toBeLessThanOrEqual(100);
  });

  it('flags CONSIDER_ADJUSTING_GOAL when required average exceeds 100', async () => {
    setupGoal(90);
    // Past: 60% weight average 40
    const past = [
      { grade: 40, weight: 30 },
      { grade: 40, weight: 30 },
    ];
    // Future: 40% with no grades
    const future = [{ grade: null, weight: 40 }];
    setupEvents(past, future);

    const result = await getGoalReport(USER_ID, GOAL_ID);
    expect(result.report.achievable).toBe(false);
    expect(result.report.requiredAvgForRemaining).toBeGreaterThan(100);
    expect(result.report.recommendation).toBe('CONSIDER_ADJUSTING_GOAL');
  });

  it('treats goal as achieved when no remaining weight and current >= target', async () => {
    setupGoal(75);
    // Past 100% weight already graded
    const past = [
      { grade: 80, weight: 100 },
    ];
    setupEvents(past, []);

    const res = await getGoalReport(USER_ID, GOAL_ID);

    expect(res.report.achievable).toBe(true);
    expect(res.report.requiredAvgForRemaining).toBeNull();
  });


  it('flags error when total event weight exceeds 100', async () => {
  setupGoal(80);
  // Past: 60% weight, Future: 50% weight (total 110%)
  const past = [
    { grade: 70, weight: 60 },
  ];
  const future = [
    { grade: null, weight: 50 },
  ];
  setupEvents(past, future);

  const result = await getGoalReport(USER_ID, GOAL_ID);

  // Adjust this expectation to match your actual error handling
  expect(result.success).toBe(false);
  expect(result.errors).toEqual(['Total weight exceeds 100%']);
});
});