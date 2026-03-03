import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/services/api'
import { Course } from '@/types'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [difficulties, setDifficulties] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesRes, topicsRes, difficultiesRes] = await Promise.all([
          apiClient.get<Course[]>('/courses'),
          apiClient.get<{ topics: string[] }>('/courses/filters/topics'),
          apiClient.get<{ difficulties: string[] }>('/courses/filters/difficulties'),
        ])

        setCourses(coursesRes.data)
        setTopics(topicsRes.data.topics)
        setDifficulties(difficultiesRes.data.difficulties)
      } catch (error) {
        console.error('Failed to load courses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...courses]

    if (selectedTopic) {
      filtered = filtered.filter((course) => course.topic === selectedTopic)
    }

    if (selectedDifficulty) {
      filtered = filtered.filter((course) => course.difficulty === selectedDifficulty)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
      )
    }

    setFilteredCourses(filtered)
  }, [courses, selectedTopic, selectedDifficulty, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Course Catalog</h1>

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search</label>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Topic Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Topics</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Levels</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Link
                key={course.course_id}
                to={`/courses/${course.course_id}`}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-md hover:border-primary transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-foreground flex-1">{course.title}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-accent text-accent-foreground ml-2">
                    {course.difficulty}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Topic:</span>
                    <span className="text-foreground font-medium">{course.topic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="text-foreground font-medium">{course.duration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enrolled:</span>
                    <span className="text-foreground font-medium">{course.enrollment_count || 0}</span>
                  </div>
                  {(course.average_rating || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="text-foreground font-medium">
                        {course.average_rating?.toFixed(1)}/5
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No courses found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
