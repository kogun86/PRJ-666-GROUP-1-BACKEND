import { getEvents } from '../src/features/events/event.controller.js';
import Event from '../src/shared/models/event.model.js';
import Course from '../src/shared/models/course.model.js';

jest.mock('../src/shared/models/event.model.js');
jest.mock('../src/shared/models/course.model.js');

describe('GET /events?courseId=', () => {
  const userId = 'user123';
  const courseId = 'courseABC';

  // Mock events: two for the course, one for another course
  const mockEvents = [
    { _id: '1', userId, courseID: courseId, start: new Date('2024-06-01') },
    { _id: '2', userId, courseID: courseId, start: new Date('2024-06-02') },
    { _id: '3', userId, courseID: 'otherCourse', start: new Date('2024-06-03') },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns only events for the specified courseId', async () => {
    // Mock Event.find to return only events with the specified courseId
    Event.find.mockImplementation((query) => {
      // Simulate MongoDB query filtering
      const filtered = mockEvents.filter(
        (e) => e.userId === query.userId && e.courseID === query.courseID
      );
      // Simulate sort by start date
      filtered.sort((a, b) => a.start - b.start);
      return {
        sort: () => filtered,
      };
    });

    const result = await getEvents(userId, false, false, null, null, courseId);

    expect(Event.find).toHaveBeenCalledWith({ userId, isCompleted: false, courseID: courseId });
    expect(result.success).toBe(true);
    expect(result.events).toHaveLength(2);
    expect(result.events.every(e => e.courseID === courseId)).toBe(true);
  });

  it('returns empty array if no events for the course', async () => {
    Event.find.mockImplementation((query) => {
      const filtered = mockEvents.filter(
        (e) => e.userId === query.userId && e.courseID === query.courseID
      );
      // Simulate sort by start date
      filtered.sort((a, b) => a.start - b.start);
      return {
        sort: () => filtered,
      };
    });

    const result = await getEvents(userId, false, false, null, null, '684e10ca3fefdcd7389ea1bf');

    expect(Event.find).toHaveBeenCalledWith({ userId, isCompleted: false, courseID: '684e10ca3fefdcd7389ea1bf' });
    expect(result.success).toBe(true);
    expect(result.events).toHaveLength(0);
  });

  it('returns all events for user if courseId is not specified', async () => {
    Event.find.mockImplementation((query) => {
      const filtered = mockEvents.filter(
        (e) => e.userId === query.userId
      );
      return { sort: () => filtered };
    });

    const result = await getEvents(userId, false, false, null, null, undefined);

    expect(Event.find).toHaveBeenCalledWith({ userId, isCompleted: false });
    expect(result.success).toBe(true);
    expect(result.events).toHaveLength(3);
    expect(result.events.every(e => e.userId === userId)).toBe(true);
  });
});