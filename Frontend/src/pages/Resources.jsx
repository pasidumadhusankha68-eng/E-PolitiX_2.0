import { useState } from 'react'
import Navbar from '../components/Navbar'

const resources = [
  {
    id: 1,
    title: 'Sri Lanka Constitution',
    category: 'Documents',
    type: 'pdf',
    url: '#',
  },
  {
    id: 2,
    title: 'Parliamentary Procedures Guide',
    category: 'Guides',
    type: 'pdf',
    url: '#',
  },
  {
    id: 3,
    title: 'Local Government Act',
    category: 'Documents',
    type: 'pdf',
    url: '#',
  },
  {
    id: 4,
    title: 'How to Vote: Step by Step',
    category: 'Videos',
    type: 'video',
    url: '#',
  },
  {
    id: 5,
    title: 'Political Party Registration',
    category: 'Guides',
    type: 'pdf',
    url: '#',
  },
  {
    id: 6,
    title: 'Election Commission Reports',
    category: 'Reports',
    type: 'link',
    url: '#',
  },
  {
    id: 7,
    title: 'Civic Education Curriculum',
    category: 'Education',
    type: 'pdf',
    url: '#',
  },
  {
    id: 8,
    title: 'Youth Parliament Initiative',
    category: 'Programs',
    type: 'link',
    url: '#',
  },
]

const categories = ['All', 'Past Papers', 'Notes']

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = activeCategory === 'All' || resource.category === activeCategory
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23 7.41V23a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V1a2 2 0 0 1 2-2h5.59" />
            <polygon points="23 7 16 12 23 17" />
          </svg>
        )
      case 'link':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Resources</h1>
          <p className="text-slate-600 mt-1">Access documents, guides, videos, and more for civic education</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Resource categories">
            {categories.map((category) => (
              <button
                key={category}
                role="tab"
                aria-selected={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="">
            {filteredResources.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-slate-900">No resources found</h3>
                <p className="text-slate-500">Try adjusting your search or filter</p>
              </div>
            ) : (
              filteredResources.map((resource) => (
                <article
                  key={resource.id}
                  className="group border border-slate-200 rounded-xl p-5 hover:border-sky-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-sky-50 text-sky-700 rounded-full mb-2">
                        {resource.category}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {resource.title}
                      </h3>
                    </div>
                    <div className="flex-shrink-0">
                      {getTypeIcon(resource.type)}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-2">{resource.description}</p>
                  
                </article>
              ))
            )}
          </div>

          {filteredResources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                Showing {filteredResources.length} of {resources.length} resources
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}