import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { courseApi } from '@/utils/adminCourseApi';

const CourseForm = ({ course, mode, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    summary: '',
    thumbnail: '',
    previewVideo: '',
    introVideo: '',
    price: 0,
    originalPrice: 0,
    isFree: false,
    category: '',
    subcategory: '',
    level: 'beginner',
    language: 'English',
    tags: [],
    whatYouWillLearn: [''],
    prerequisites: [''],
    targetAudience: [''],
    isPublished: false,
    featured: false,
    bestseller: false,
    hasSubtitles: false,
    hasCertificate: true,
    lifetime_access: true,
    mobile_access: true,
    metaDescription: '',
    metaKeywords: []
  });

  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && course) {
      setFormData({
        title: course.title || '',
        subtitle: course.subtitle || '',
        description: course.description || '',
        summary: course.summary || '',
        thumbnail: course.thumbnail || '',
        previewVideo: course.previewVideo || '',
        introVideo: course.introVideo || '',
        price: course.price || 0,
        originalPrice: course.originalPrice || 0,
        isFree: course.isFree || false,
        category: course.category || '',
        subcategory: course.subcategory || '',
        level: course.level || 'beginner',
        language: course.language || 'English',
        tags: course.tags || [],
        whatYouWillLearn: course.whatYouWillLearn?.length ? course.whatYouWillLearn : [''],
        prerequisites: course.prerequisites?.length ? course.prerequisites : [''],
        targetAudience: course.targetAudience?.length ? course.targetAudience : [''],
        isPublished: course.isPublished || false,
        featured: course.featured || false,
        bestseller: course.bestseller || false,
        hasSubtitles: course.hasSubtitles || false,
        hasCertificate: course.hasCertificate !== undefined ? course.hasCertificate : true,
        lifetime_access: course.lifetime_access !== undefined ? course.lifetime_access : true,
        mobile_access: course.mobile_access !== undefined ? course.mobile_access : true,
        metaDescription: course.metaDescription || '',
        metaKeywords: course.metaKeywords || []
      });
    }
  }, [course, mode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.metaKeywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        metaKeywords: [...prev.metaKeywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up array fields - remove empty strings
      const cleanedData = {
        ...formData,
        whatYouWillLearn: formData.whatYouWillLearn.filter(item => item.trim()),
        prerequisites: formData.prerequisites.filter(item => item.trim()),
        targetAudience: formData.targetAudience.filter(item => item.trim())
      };

      if (mode === 'create') {
        await courseApi.create(cleanedData);
        toast.success('Course created successfully');
      } else {
        await courseApi.update(course._id, cleanedData);
        toast.success('Course updated successfully');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${mode} course`);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Programming',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'Cloud Computing',
    'Cybersecurity',
    'Design',
    'Business',
    'Marketing'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all levels', label: 'All Levels' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter course title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Short description"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Detailed course description"
            rows={4}
            required
          />
        </div>

        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            placeholder="Brief course summary"
            rows={2}
          />
        </div>
      </div>

      {/* Media */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Media</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="thumbnail">Thumbnail URL *</Label>
            <Input
              id="thumbnail"
              value={formData.thumbnail}
              onChange={(e) => handleInputChange('thumbnail', e.target.value)}
              placeholder="Course thumbnail URL"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="previewVideo">Preview Video URL</Label>
            <Input
              id="previewVideo"
              value={formData.previewVideo}
              onChange={(e) => handleInputChange('previewVideo', e.target.value)}
              placeholder="Preview video URL"
            />
          </div>
          
          <div>
            <Label htmlFor="introVideo">Intro Video URL</Label>
            <Input
              id="introVideo"
              value={formData.introVideo}
              onChange={(e) => handleInputChange('introVideo', e.target.value)}
              placeholder="Intro video URL"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pricing</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.isFree}
            onCheckedChange={(checked) => handleInputChange('isFree', checked)}
          />
          <Label>Free Course</Label>
        </div>

        {!formData.isFree && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="Course price"
                min="0"
                step="0.01"
                required={!formData.isFree}
              />
            </div>
            
            <div>
              <Label htmlFor="originalPrice">Original Price (₹)</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                placeholder="Original price (for discounts)"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}
      </div>

      {/* Course Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Course Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, '-')}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="level">Level *</Label>
            <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="subcategory">Subcategory</Label>
          <Input
            id="subcategory"
            value={formData.subcategory}
            onChange={(e) => handleInputChange('subcategory', e.target.value)}
            placeholder="Course subcategory"
          />
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Learning Outcomes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Learning Outcomes</h3>
        
        <div>
          <Label>What You'll Learn</Label>
          {formData.whatYouWillLearn.map((item, index) => (
            <div key={index} className="flex gap-2 mt-2">
              <Input
                value={item}
                onChange={(e) => handleArrayChange('whatYouWillLearn', index, e.target.value)}
                placeholder="Learning outcome"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeArrayItem('whatYouWillLearn', index)}
                disabled={formData.whatYouWillLearn.length === 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addArrayItem('whatYouWillLearn')}
            className="mt-2"
          >
            Add Learning Outcome
          </Button>
        </div>

        <div>
          <Label>Prerequisites</Label>
          {formData.prerequisites.map((item, index) => (
            <div key={index} className="flex gap-2 mt-2">
              <Input
                value={item}
                onChange={(e) => handleArrayChange('prerequisites', index, e.target.value)}
                placeholder="Prerequisite"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeArrayItem('prerequisites', index)}
                disabled={formData.prerequisites.length === 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addArrayItem('prerequisites')}
            className="mt-2"
          >
            Add Prerequisite
          </Button>
        </div>

        <div>
          <Label>Target Audience</Label>
          {formData.targetAudience.map((item, index) => (
            <div key={index} className="flex gap-2 mt-2">
              <Input
                value={item}
                onChange={(e) => handleArrayChange('targetAudience', index, e.target.value)}
                placeholder="Target audience"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeArrayItem('targetAudience', index)}
                disabled={formData.targetAudience.length === 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addArrayItem('targetAudience')}
            className="mt-2"
          >
            Add Target Audience
          </Button>
        </div>
      </div>

      {/* Course Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Course Settings</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isPublished}
              onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
            />
            <Label>Published</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.featured}
              onCheckedChange={(checked) => handleInputChange('featured', checked)}
            />
            <Label>Featured</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.bestseller}
              onCheckedChange={(checked) => handleInputChange('bestseller', checked)}
            />
            <Label>Bestseller</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.hasSubtitles}
              onCheckedChange={(checked) => handleInputChange('hasSubtitles', checked)}
            />
            <Label>Subtitles</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.hasCertificate}
              onCheckedChange={(checked) => handleInputChange('hasCertificate', checked)}
            />
            <Label>Certificate</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.lifetime_access}
              onCheckedChange={(checked) => handleInputChange('lifetime_access', checked)}
            />
            <Label>Lifetime Access</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.mobile_access}
              onCheckedChange={(checked) => handleInputChange('mobile_access', checked)}
            />
            <Label>Mobile Access</Label>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">SEO</h3>
        
        <div>
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={formData.metaDescription}
            onChange={(e) => handleInputChange('metaDescription', e.target.value)}
            placeholder="SEO meta description"
            rows={2}
          />
        </div>

        <div>
          <Label>Meta Keywords</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.metaKeywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {keyword}
                <X className="w-3 h-3 cursor-pointer" onClick={() => removeKeyword(keyword)} />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add keyword"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            />
            <Button type="button" onClick={addKeyword} variant="outline">
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? 'Saving...' : mode === 'create' ? 'Create Course' : 'Update Course'}
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;
