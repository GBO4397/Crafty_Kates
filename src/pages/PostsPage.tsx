import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, User, Tag, Search, Filter, ChevronDown, ChevronUp, ArrowLeft, BookOpen, PenTool, ArrowRight } from 'lucide-react';
import Navigation from '@/components/crafty/Navigation';
import Footer from '@/components/crafty/Footer';
import PostSubmitModal from '@/components/crafty/PostSubmitModal';

interface Post {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  date: string;
  category: string;
  image: string;
  summary: string;
  content: string[];
  tags: string[];
  readingTime: string;
  featured?: boolean;
}

const ALL_POSTS: Post[] = [
  {
    id: 'rodney-potter',
    title: 'Rodney Potter',
    subtitle: 'Shade Tree Racing and the Art of Man, Machine, and Time',
    author: 'Katherine Piroska-Savoie',
    date: 'December 21, 2025',
    category: 'Feature Story',
    image: '/images/site/Rodney5.jpg',
    summary: 'For Rodney Potter, drag racing has never been just about speed. It\'s about the connection between man and machine—the mechanics, the physics, the skill, and the quiet intrigue of making something work better than it ever should.',
    content: [
      'For Rodney Potter, drag racing has never been just about speed. It\'s about the connection between man and machine—the mechanics, the physics, the skill, and the quiet intrigue of making something work better than it ever should. From an early age, Rodney was drawn to how things functioned, how power met pavement, and how mastery came not only from horsepower, but from understanding the tree, the clock, and the moment.',
      'Rodney\'s racing story began at 19 years old with his first car, a 1965 Ford Fairlane, which he raced in the Stock class. Like many young racers of that era, he quickly wanted more. His goal was to turn the Fairlane into a B/FX stocker, a class that demanded creativity, mechanical knowledge, and commitment. When he asked his father for help making the changeover, the answer wasn\'t exactly yes—but it wasn\'t no either.',
      'His father told him, "You can work on it here under the tree, but you put my tools away every day."',
      'That simple condition marked the true beginning of Shade Tree Racing.',
      'Under that tree, Rodney learned to do things the hard way—working with limited resources, figuring things out on his own, and earning every improvement one bolt at a time. Family, friends, and what Rodney jokingly calls "shade tree squirrels" came and went, but the spirit stayed the same: work hard, respect the process, and never cut corners. The shade tree wasn\'t just a place to wrench—it became a mindset.',
      'Years later, in the spring of 2017, that mindset came full circle. Rodney\'s son spotted a gasser project for sale and told his father, "This is your chance to get back into racing." It didn\'t take much convincing. Rodney had always loved old-school racing, and even more than that, he loved building cars and understanding the physics behind them.',
      'Why a gasser? Because gassers demand respect. They require balance, precision, and knowledge. To make a gasser work—to make it hook and go—the majority of the weight must stay on the rear tires the entire way down the track. There\'s no hiding mistakes. Every launch tells the truth.',
      'Rodney purchased a 1941 Tudor Sedan, powered by a 410 CID small-block Ford, backed by a Powerglide transmission. True to form, the car became known as "Squirrel," and Rodney returned to the track in 2017—right where he belonged.',
      'Since then, Rodney has raced Squirrel continuously, traveling to 19 different states and competing on 42 different tracks. He has raced with 10 different gasser groups across the country, including well-known organizations like Southern Outlaws, Dirty South Gassers, Backwoods Gassers, and many more.',
      'But for Rodney, it was never about the trophies—though there have been many. It was always about the process: the build, the tune, the launch, and the satisfaction of knowing that everything under the hood was done right, by hand, under the shade tree.',
    ],
    tags: ['Drag Racing', 'Gasser', 'Ford', 'Shade Tree Racing', '1941 Tudor Sedan'],
    readingTime: '4 min read',
    featured: true,
  },
];

const CATEGORIES = ['All', ...new Set(ALL_POSTS.map(p => p.category))];
const ALL_TAGS = [...new Set(ALL_POSTS.flatMap(p => p.tags))];

const PostsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('post');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(postId);

  const filteredPosts = useMemo(() => {
    return ALL_POSTS.filter(post => {
      const matchesSearch = !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchQuery, selectedCategory, selectedTag]);

  // If viewing a specific post
  const viewingPost = postId ? ALL_POSTS.find(p => p.id === postId) : null;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <Navigation />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a0a12] via-[#2d1020] to-[#1a0a12] py-16 sm:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FB50B1]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#9E065D]/15 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link to="/" className="text-white/40 hover:text-[#FB50B1] transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-[#FB50B1]">Posts & Features</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FB50B1]/15 border border-[#FB50B1]/25 rounded-full px-4 py-1.5 mb-4">
                <BookOpen size={14} className="text-[#FB50B1]" />
                <span className="text-[#FB50B1] text-sm font-medium">Community Stories</span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wider mb-3">
                POSTS & FEATURES
              </h1>
              <p className="text-white/50 max-w-lg text-sm">
                Stories from the community — car builds, racing adventures, restorations, and the people behind the machines.
              </p>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FB50B1] to-[#FF7AC6] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#FB50B1]/30 transition-all group self-start lg:self-auto"
            >
              <PenTool size={16} />
              Submit a Post
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-gray-50 border-b border-gray-200 sticky top-[80px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB50B1]/40 focus:border-[#FB50B1] text-sm bg-white"
              />
            </div>
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#9E065D] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FB50B1]/30 hover:text-[#9E065D]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Tag Filter */}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag('')}
                className="inline-flex items-center gap-1 px-3 py-2 bg-[#FEE6F4] text-[#9E065D] rounded-lg text-sm font-medium"
              >
                <Tag size={12} />
                {selectedTag}
                <span className="ml-1 text-[#9E065D]/50 hover:text-[#9E065D]">&times;</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-500 text-sm mb-6">{filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found</p>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedTag(''); }} className="text-[#9E065D] font-medium hover:text-[#FB50B1]">Clear all filters</button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                    {/* Image */}
                    <div className="relative overflow-hidden lg:col-span-1">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-64 lg:h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://craftykates.com/wp-content/uploads/2025/12/2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg'; }}
                      />
                      {post.featured && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">Featured</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 lg:p-8 lg:col-span-2">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-[#FEE6F4] text-[#9E065D] text-xs font-semibold rounded-full">{post.category}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {post.readingTime}
                        </span>
                      </div>

                      <h2 className="text-2xl lg:text-3xl font-heading font-bold text-gray-900 mb-1">{post.title}</h2>
                      {post.subtitle && (
                        <p className="text-lg text-[#9E065D] font-medium italic mb-3">{post.subtitle}</p>
                      )}

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-full flex items-center justify-center">
                          <User size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{post.author}</p>
                          <p className="text-xs text-gray-500">{post.date}</p>
                        </div>
                      </div>

                      <p className="text-gray-600 leading-relaxed mb-4">{post.summary}</p>

                      {/* Expanded Content */}
                      {expandedPost === post.id && (
                        <div className="space-y-4 mb-4 animate-fade-in">
                          {post.content.slice(1).map((paragraph, idx) => (
                            <p key={idx} className="text-gray-600 leading-relaxed text-sm">
                              {paragraph === 'His father told him, "You can work on it here under the tree, but you put my tools away every day."' ||
                               paragraph === 'That simple condition marked the true beginning of Shade Tree Racing.' ? (
                                <em className="text-gray-800 font-medium">{paragraph}</em>
                              ) : paragraph}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 hover:bg-[#FEE6F4] text-gray-600 hover:text-[#9E065D] text-xs rounded-full transition-colors cursor-pointer"
                          >
                            <Tag size={10} />
                            {tag}
                          </button>
                        ))}
                      </div>

                      {/* Read More / Less */}
                      <button
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9E065D] text-white text-sm font-semibold rounded-xl hover:bg-[#7D0348] transition-colors"
                      >
                        {expandedPost === post.id ? (
                          <><ChevronUp size={16} /> Show Less</>
                        ) : (
                          <><ChevronDown size={16} /> Read Full Story</>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Submit CTA */}
          <div className="mt-16 bg-gradient-to-r from-[#1a0a12] via-[#2d0f1f] to-[#1a0a12] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 left-8 w-24 h-24 border border-[#FB50B1] rounded-full" />
              <div className="absolute bottom-4 right-12 w-32 h-32 border border-[#FB50B1] rounded-full" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#FB50B1]/30">
                <PenTool size={24} className="text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">Have a Story to Share?</h3>
              <p className="text-white/70 max-w-lg mx-auto mb-6 text-sm md:text-base">
                Submit your post and share your story with the Crafty Kates community.
              </p>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#FB50B1] to-[#FF7AC6] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#FB50B1]/30 transition-all group"
              >
                <PenTool size={18} />
                Submit Your Post
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <PostSubmitModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} />
    </div>
  );
};

export default PostsPage;
