import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, Tag, ChevronDown, ChevronUp, ExternalLink, PenTool, BookOpen, ArrowRight } from 'lucide-react';
import PostSubmitModal from './PostSubmitModal';
import BackToTop from './BackToTop';

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
  sourceUrl?: string;
  readingTime: string;
  featured?: boolean;
}

const POSTS: Post[] = [
  {
    id: 'rodney-potter',
    title: 'Rodney Potter',
    subtitle: 'Shade Tree Racing and the Art of Man, Machine, and Time',
    author: 'Katherine Piroska-Savoie',
    date: 'December 21, 2025',
    category: 'Feature Story',
    image: 'https://craftykates.com/wp-content/uploads/2025/12/Rodney5.jpg',
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
    sourceUrl: 'https://craftykates.com/index.php/2025/12/21/rodney-potter/',
    readingTime: '4 min read',
    featured: true,
  },
];

const PostsSection: React.FC = () => {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const featuredPost = POSTS.find((p) => p.featured);
  const regularPosts = POSTS.filter((p) => !p.featured);

  return (
    <section id="posts" className="py-20 bg-gradient-to-b from-white via-[#FEF7FB] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FEE6F4] rounded-full mb-4">
            <BookOpen size={14} className="text-[#9E065D]" />
            <span className="text-sm font-semibold text-[#9E065D] tracking-wide uppercase">Community Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
            Posts & Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Stories from the community — car builds, racing adventures, restorations, and the people behind the machines.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FB50B1]/25 transition-all group"
            >
              <PenTool size={16} />
              Submit a Post
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/posts"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#9E065D]/30 text-[#9E065D] font-semibold rounded-xl hover:bg-[#FEE6F4] transition-all"
            >
              <BookOpen size={16} />
              View All Posts
            </Link>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={imgError ? 'https://craftykates.com/wp-content/uploads/2025/12/2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg' : featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-72 lg:h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={() => setImgError(true)}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#9E065D] to-[#FB50B1] text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-[#FEE6F4] text-[#9E065D] text-xs font-semibold rounded-full">
                        {featuredPost.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {featuredPost.readingTime}
                      </span>
                    </div>

                    <h3 className="text-2xl lg:text-3xl font-heading font-bold text-gray-900 mb-1">
                      {featuredPost.title}
                    </h3>
                    {featuredPost.subtitle && (
                      <p className="text-lg text-[#9E065D] font-medium italic mb-4">
                        {featuredPost.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-full flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{featuredPost.author}</p>
                        <p className="text-xs text-gray-500">{featuredPost.date}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-4">
                      {featuredPost.summary}
                    </p>

                    {/* Expanded Content */}
                    {expandedPost === featuredPost.id && (
                      <div className="space-y-4 mb-4 animate-fade-in">
                        {featuredPost.content.slice(1).map((paragraph, idx) => (
                          <p key={idx} className="text-gray-600 leading-relaxed text-sm">
                            {paragraph === 'His father told him, "You can work on it here under the tree, but you put my tools away every day."' ||
                             paragraph === 'That simple condition marked the true beginning of Shade Tree Racing.' ? (
                              <em className="text-gray-800 font-medium">{paragraph}</em>
                            ) : (
                              paragraph
                            )}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {featuredPost.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setExpandedPost(expandedPost === featuredPost.id ? null : featuredPost.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9E065D] text-white text-sm font-semibold rounded-xl hover:bg-[#7D0348] transition-colors"
                    >
                      {expandedPost === featuredPost.id ? (
                        <>
                          <ChevronUp size={16} />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Read Full Story
                        </>
                      )}
                    </button>
                    <Link
                      to={`/posts?post=${featuredPost.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#9E065D]/30 text-[#9E065D] text-sm font-semibold rounded-xl hover:bg-[#FEE6F4] transition-colors"
                    >
                      <ExternalLink size={16} />
                      View Full Post
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        {regularPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {regularPosts.map((post) => (
              <Link
                key={post.id}
                to={`/posts?post=${post.id}`}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://craftykates.com/wp-content/uploads/2025/12/2024_03_Classic_Cars_Classic_Burgers-100-14.jpeg'; }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 bg-[#FEE6F4] text-[#9E065D] text-xs font-semibold rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#9E065D] transition-colors">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <User size={12} />
                    <span>{post.author}</span>
                    <span className="text-gray-300">|</span>
                    <span>{post.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">{post.summary}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9E065D] hover:text-[#FB50B1] transition-colors">
                    Read More
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Submit Post CTA Banner */}
        <div className="bg-gradient-to-r from-[#1a0a12] via-[#2d0f1f] to-[#1a0a12] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 left-8 w-24 h-24 border border-[#FB50B1] rounded-full" />
            <div className="absolute bottom-4 right-12 w-32 h-32 border border-[#FB50B1] rounded-full" />
            <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-[#FB50B1] rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#FB50B1]/30">
              <PenTool size={24} className="text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
              Have a Story to Share?
            </h3>
            <p className="text-white/70 max-w-lg mx-auto mb-6 text-sm md:text-base">
              Whether it's a car build, a racing adventure, a restoration project, or a tribute to someone in the community — we want to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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

        <BackToTop />
      </div>

      <PostSubmitModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} />
    </section>
  );
};

export default PostsSection;
