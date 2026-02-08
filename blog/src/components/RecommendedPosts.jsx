import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Sparkles, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { getRecommendations } from '../services/recommendationService';
import { formatDateOnly } from '../utils/dateUtils';

export default function RecommendedPosts({ allPosts, onViewPost }) {
    const [recommendations, setRecommendations] = useState([]);
    const [title, setTitle] = useState('Recommended for You');

    useEffect(() => {
        // Small delay to ensure local storage is updated if we just navigated
        const timer = setTimeout(() => {
            let recs = getRecommendations(allPosts, 3);

            // Fallback to latest posts if no recommendations
            if (recs.length === 0 && allPosts.length > 0) {
                recs = allPosts
                    .filter(post => post.status === 'published')
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                    .slice(0, 3);
                setTitle('Latest Articles');
            } else {
                setTitle('Recommended for You');
            }

            setRecommendations(recs);
        }, 100);

        return () => clearTimeout(timer);
    }, [allPosts]); // Re-run if posts change

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <section className="py-12 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center mb-8">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map(post => (
                        <Card key={post.id} className="hover:shadow-lg transition-all h-full flex flex-col border-indigo-100/50">
                            <CardHeader>
                                <div className="flex items-center space-x-2 text-xs text-indigo-600 mb-2">
                                    <BookOpen className="w-3 h-3" />
                                    <span>{post.tags.split(',')[0].trim()}</span>
                                </div>
                                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {post.excerpt || post.content.substring(0, 100) + '...'}
                                </p>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>{formatDateOnly(post.updatedAt) || 'Recently'}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                    onClick={() => onViewPost(post)}
                                >
                                    <span className="text-sm">Read Article</span>
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
