import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Save, Upload, Clock, Edit3, FileText, Tag, AlertCircle, CheckCircle, Image, X, UploadCloud, Eye, EyeOff } from 'lucide-react';
import { uploadImage, validateImageFile } from '../services/imageService';
import { useAuth } from '../contexts/AuthContext';

export default function Editor({
  currentPost,
  isSaving,
  lastSaved,
  title,
  content,
  tags,
  imageUrl,
  setTitle,
  setContent,
  setTags,
  setImageUrl,
  handleSaveDraft,
  handlePublish,
}) {
  const { currentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState('');

  const titleLength = title.length;
  const contentLength = content.length;
  const tagsArray = tags.split(',').filter(tag => tag.trim()).length;
  
  const isFormValid = title.trim() && content.trim();
  const hasUnsavedChanges = title || content;

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if user is authenticated
    if (!currentUser) {
      setImageError('Please log in to upload images');
      return;
    }

    // Clear previous errors
    setImageError('');

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setImageError(validation.errors[0]);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await uploadImage(file, currentUser.uid);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setImageUrl(result.url);
      
      // Update the post data with image information
      if (currentPost) {
        // For existing posts, we'll need to update the post data
        // This will be handled by the parent component
      }
      
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);

    } catch (error) {
      setImageError(error.message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageUrl('');
    setImageError('');
  };

  // Safety check for currentUser
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to create or edit posts.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {currentPost ? 'Edit Post' : 'Create New Post'}
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            {currentPost ? 'Update your existing blog post' : 'Share your thoughts with the world'}
          </p>
        </div>

        {/* Main Editor Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-gray-800">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                {currentPost ? 'Edit Post' : 'New Post'}
              </CardTitle>
              {lastSaved && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-50 border border-green-200 rounded-full">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium text-green-700">
                    Saved {new Date(lastSaved).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Title Section */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="title" className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
                <span>Title</span>
                {titleLength > 0 && (
                  <span className="text-xs text-gray-500">({titleLength} characters)</span>
                )}
              </Label>
              <div className="relative">
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Enter your compelling blog title..." 
                  className="text-base sm:text-lg font-medium border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-10 sm:h-12"
                />
                {titleLength > 60 && (
                  <div className="absolute -bottom-5 sm:-bottom-6 left-0 flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>Consider a shorter title for better SEO</span>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Image Section */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-600" />
                <span>Featured Image</span>
                {imageUrl && (
                  <span className="text-xs text-gray-500">(Image uploaded)</span>
                )}
              </Label>
              
              {!imageUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors duration-200">
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Upload a featured image
                      </p>
                      <p className="text-xs text-gray-500 mb-2 sm:mb-3">
                        JPEG, PNG, GIF, or WebP (max 5MB)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('image-upload').click()}
                        disabled={isUploading}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1 sm:mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Choose Image
                          </>
                        )}
                      </Button>
                    </div>
                    {isUploading && (
                      <div className="w-full max-w-xs">
                        <div className="bg-gray-200 rounded-full h-1.5 sm:h-2">
                          <div 
                            className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Featured image"
                      className="w-full h-32 sm:h-40 md:h-48 object-cover"
                      onError={() => setImageError('Failed to load image')}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleRemoveImage}
                        className="bg-red-500/90 hover:bg-red-600 text-white text-xs"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Image uploaded successfully</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('image-upload').click()}
                      disabled={isUploading}
                      className="text-xs"
                    >
                      Replace Image
                    </Button>
                  </div>
                </div>
              )}
              
              {imageError && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{imageError}</span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="content" className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
                <span>Content</span>
                {contentLength > 0 && (
                  <span className="text-xs text-gray-500">({contentLength} characters)</span>
                )}
              </Label>
              <div className="relative">
                <Textarea 
                  id="content" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Write your blog content here... Start with an engaging introduction that hooks your readers!" 
                  className="min-h-[300px] sm:min-h-[400px] text-sm sm:text-base leading-relaxed border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                />
                {contentLength > 0 && (
                  <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
                    {contentLength} chars
                  </div>
                )}
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="tags" className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Tags</span>
                {tagsArray > 0 && (
                  <span className="text-xs text-gray-500">({tagsArray} tags)</span>
                )}
              </Label>
              <Input 
                id="tags" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)} 
                placeholder="technology, react, web development, programming..." 
                className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
              <p className="text-xs text-gray-500">
                Separate tags with commas. Tags help readers discover your content.
              </p>
            </div>

            {/* Writing Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Writing Tips
              </h3>
              <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                <li>• Write a compelling title that grabs attention</li>
                <li>• Start with a strong hook in your first paragraph</li>
                <li>• Use clear, concise language</li>
                <li>• Break up text with headings and paragraphs</li>
                <li>• Add relevant tags to help readers find your post</li>
                <li>• Include a featured image to make your post more engaging</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft} 
                disabled={isSaving || !hasUnsavedChanges}
                className="flex-1 h-10 sm:h-12 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 text-sm sm:text-base"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                onClick={handlePublish} 
                disabled={isSaving || !isFormValid}
                className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {isSaving ? 'Publishing...' : 'Publish Post'}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Status Bar */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-600 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            {isSaving && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving changes...</span>
              </div>
            )}
            {isUploading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading image...</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {titleLength > 0 && (
              <span>Title: {titleLength} chars</span>
            )}
            {contentLength > 0 && (
              <span>Content: {contentLength} chars</span>
            )}
            {tagsArray > 0 && (
              <span>Tags: {tagsArray}</span>
            )}
            {imageUrl && (
              <span>Image: ✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
