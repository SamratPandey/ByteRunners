import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { courseApi } from '@/utils/adminCourseApi';

const CurriculumEditor = ({ course, onSuccess, onCancel }) => {
  const [curriculum, setCurriculum] = useState(
    course?.curriculum || [
      {
        title: 'Introduction',
        description: '',
        order: 0,
        lessons: [
          {
            title: 'Welcome to the Course',
            type: 'video',
            content: '',
            videoUrl: '',
            duration: 0,
            isPreview: false,
            order: 0
          }
        ]
      }
    ]
  );
  
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);

  const addSection = () => {
    const newSection = {
      title: `Section ${curriculum.length + 1}`,
      description: '',
      order: curriculum.length,
      lessons: []
    };
    setCurriculum([...curriculum, newSection]);
  };

  const updateSection = (sectionIndex, field, value) => {
    const updated = curriculum.map((section, index) => 
      index === sectionIndex ? { ...section, [field]: value } : section
    );
    setCurriculum(updated);
  };

  const deleteSection = (sectionIndex) => {
    if (curriculum.length === 1) {
      toast.error('Course must have at least one section');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this section?')) {
      const updated = curriculum.filter((_, index) => index !== sectionIndex);
      setCurriculum(updated);
    }
  };

  const addLesson = (sectionIndex) => {
    const newLesson = {
      title: `Lesson ${curriculum[sectionIndex].lessons.length + 1}`,
      type: 'video',
      content: '',
      videoUrl: '',
      duration: 0,
      isPreview: false,
      order: curriculum[sectionIndex].lessons.length
    };

    const updated = curriculum.map((section, index) => 
      index === sectionIndex 
        ? { ...section, lessons: [...section.lessons, newLesson] }
        : section
    );
    setCurriculum(updated);
  };

  const updateLesson = (sectionIndex, lessonIndex, field, value) => {
    const updated = curriculum.map((section, secIndex) => 
      secIndex === sectionIndex 
        ? {
            ...section,
            lessons: section.lessons.map((lesson, lesIndex) => 
              lesIndex === lessonIndex ? { ...lesson, [field]: value } : lesson
            )
          }
        : section
    );
    setCurriculum(updated);
  };

  const deleteLesson = (sectionIndex, lessonIndex) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      const updated = curriculum.map((section, secIndex) => 
        secIndex === sectionIndex 
          ? {
              ...section,
              lessons: section.lessons.filter((_, lesIndex) => lesIndex !== lessonIndex)
            }
          : section
      );
      setCurriculum(updated);
    }
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return Video;
      case 'article':
        return FileText;
      case 'quiz':
        return HelpCircle;
      case 'assignment':
        return CheckSquare;
      default:
        return Video;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await courseApi.updateCurriculum(course._id, curriculum);
      toast.success('Curriculum updated successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update curriculum');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTotalDuration = () => {
    return curriculum.reduce((total, section) => 
      total + section.lessons.reduce((sectionTotal, lesson) => 
        sectionTotal + (lesson.duration || 0), 0
      ), 0
    );
  };

  const getTotalLessons = () => {
    return curriculum.reduce((total, section) => total + section.lessons.length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Course Curriculum</h3>
          <p className="text-sm text-gray-600">
            {curriculum.length} sections • {getTotalLessons()} lessons • {formatDuration(getTotalDuration())} total
          </p>
        </div>
        <Button onClick={addSection} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Curriculum Sections */}
      <div className="space-y-4">
        {curriculum.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="border-2">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection(sectionIndex)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {expandedSections[sectionIndex] ? 
                    <ChevronDown className="w-5 h-5" /> : 
                    <ChevronRight className="w-5 h-5" />
                  }
                  <div className="flex-1">
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                      className="font-semibold text-lg border-none p-0 h-auto bg-transparent"
                      placeholder="Section title"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      {section.lessons.length} lessons
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      addLesson(sectionIndex);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSection(sectionIndex);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedSections[sectionIndex] && (
              <CardContent className="space-y-4">
                {/* Section Description */}
                <div>
                  <Label>Section Description</Label>
                  <Textarea
                    value={section.description}
                    onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                    placeholder="Optional section description"
                    rows={2}
                  />
                </div>

                {/* Lessons */}
                <div className="space-y-3">
                  {section.lessons.map((lesson, lessonIndex) => {
                    const LessonIcon = getLessonIcon(lesson.type);
                    
                    return (
                      <Card key={lessonIndex} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {/* Lesson Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <LessonIcon className="w-4 h-4 text-gray-500" />
                                <Input
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title', e.target.value)}
                                  placeholder="Lesson title"
                                  className="border-none p-0 h-auto bg-transparent font-medium"
                                />
                                {lesson.isPreview && (
                                  <Badge variant="secondary">Preview</Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteLesson(sectionIndex, lessonIndex)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Lesson Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Type</Label>
                                <Select
                                  value={lesson.type}
                                  onValueChange={(value) => updateLesson(sectionIndex, lessonIndex, 'type', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="article">Article</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                    <SelectItem value="assignment">Assignment</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Duration (minutes)</Label>
                                <Input
                                  type="number"
                                  value={lesson.duration || 0}
                                  onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'duration', parseInt(e.target.value) || 0)}
                                  min="0"
                                />
                              </div>

                              <div className="flex items-center space-x-2 mt-6">
                                <Switch
                                  checked={lesson.isPreview}
                                  onCheckedChange={(checked) => updateLesson(sectionIndex, lessonIndex, 'isPreview', checked)}
                                />
                                <Label>Preview Lesson</Label>
                              </div>
                            </div>

                            {/* Content Fields */}
                            {lesson.type === 'video' && (
                              <div>
                                <Label>Video URL</Label>
                                <Input
                                  value={lesson.videoUrl || ''}
                                  onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'videoUrl', e.target.value)}
                                  placeholder="https://example.com/video.mp4"
                                />
                              </div>
                            )}

                            <div>
                              <Label>Content</Label>
                              <Textarea
                                value={lesson.content || ''}
                                onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'content', e.target.value)}
                                placeholder={
                                  lesson.type === 'video' 
                                    ? 'Video description or transcript'
                                    : lesson.type === 'article'
                                    ? 'Article content'
                                    : lesson.type === 'quiz'
                                    ? 'Quiz instructions'
                                    : 'Assignment instructions'
                                }
                                rows={3}
                              />
                            </div>

                            {/* Quiz Questions (if quiz type) */}
                            {lesson.type === 'quiz' && (
                              <div>
                                <Label>Quiz Questions</Label>
                                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                                  Quiz questions will be managed separately in the quiz editor.
                                </div>
                              </div>
                            )}

                            {/* Downloadable Resources */}
                            <div>
                              <Label>Downloadable Resources</Label>
                              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                                Resource management will be added in a future update.
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {section.lessons.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No lessons in this section</p>
                      <Button
                        variant="outline"
                        onClick={() => addLesson(sectionIndex)}
                        className="mt-2"
                      >
                        Add First Lesson
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">Curriculum Summary</h4>
              <p className="text-sm text-gray-600">
                {curriculum.length} sections • {getTotalLessons()} lessons • {formatDuration(getTotalDuration())} total duration
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Preview lessons: {curriculum.reduce((total, section) => 
                  total + section.lessons.filter(lesson => lesson.isPreview).length, 0
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading} variant="success">
          {loading ? 'Saving...' : 'Save Curriculum'}
        </Button>
      </div>
    </div>
  );
};

export default CurriculumEditor;
