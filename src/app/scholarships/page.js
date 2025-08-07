'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, DollarSign, GraduationCap, Calendar, Users, X } from 'lucide-react';
import Layout from '../../components/Layout';

const scholarshipsData = [
  {
    id: 1,
    title: "Fulbright Scholarship Program",
    organization: "US Department of State",
    country: "United States",
    field: "All Fields",
    level: "Master's Degree",
    amount: "$25,000 - $50,000",
    deadline: "2024-10-15",
    description: "The Fulbright Program is the flagship international educational exchange program sponsored by the U.S. government.",
    applications: 1200,
    urgent: true,
    featured: true
  },
  {
    id: 2,
    title: "Chevening Scholarship",
    organization: "UK Government",
    country: "United Kingdom",
    field: "All Fields",
    level: "Master's Degree",
    amount: "£18,000 - £35,000",
    deadline: "2024-11-02",
    description: "Chevening Scholarships are the UK government's global scholarship programme.",
    applications: 850,
    urgent: false,
    featured: true
  },
  {
    id: 3,
    title: "Erasmus Mundus Joint Master",
    organization: "European Commission",
    country: "European Union",
    field: "Engineering",
    level: "Master's Degree",
    amount: "€24,000 - €49,000",
    deadline: "2024-12-01",
    description: "Erasmus Mundus Joint Master Degrees are prestigious international programmes.",
    applications: 650,
    urgent: false,
    featured: false
  }
];

export default function Scholarships() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredScholarships = scholarshipsData.filter(scholarship =>
    scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scholarship.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openScholarshipDetails = (scholarship) => {
    setSelectedScholarship(scholarship);
    setShowModal(true);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Scholarships
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Discover funding opportunities for your education worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search scholarships, organizations, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Scholarships Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Scholarships ({filteredScholarships.length})
            </h2>
            <p className="text-gray-600">
              Browse available scholarship opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredScholarships.map((scholarship) => (
              <div key={scholarship.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {scholarship.urgent && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            Urgent
                          </span>
                        )}
                        {scholarship.featured && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {scholarship.title}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-3">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        <span>{scholarship.organization}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{scholarship.country}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      <span className="text-sm">{scholarship.level}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="text-sm">{scholarship.amount}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">{scholarship.field}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {scholarship.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {scholarship.applications} applications
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openScholarshipDetails(scholarship)}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scholarship Details Modal */}
      {showModal && selectedScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedScholarship.title}</h2>
                  <p className="text-lg text-gray-600">{selectedScholarship.organization}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedScholarship.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Scholarship Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{selectedScholarship.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Field:</span>
                        <span className="font-medium">{selectedScholarship.field}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium">{selectedScholarship.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{selectedScholarship.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applications:</span>
                        <span className="font-medium">{selectedScholarship.applications}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium">{new Date(selectedScholarship.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                      Apply Now
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 