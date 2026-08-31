import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Search, 
  Ticket, 
  Users, 
  ArrowRight, 
  RefreshCw,
  Tag
} from 'lucide-react';
import { getPublicEventsApi } from '@/services/eventService';

const CATEGORIES = ['All', 'Technology', 'Development', 'Workshop', 'Security', 'Business'];

export default function EventsPage() {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await getPublicEventsApi(params);
      if (data.success) {
        setEventsList(data.events);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to load public events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="space-y-6 py-4">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explore Public Events
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse upcoming conferences, summits, and workshops. Reserve your digital access pass instantly.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEvents}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="space-y-3">
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by title, venue, or city..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-teal-600 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Loading events from database...
        </div>
      ) : eventsList.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Ticket className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No events found
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search terms or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventsList.map((evt) => {
            const fillRate = evt.total_capacity > 0
              ? Math.round((evt.registered_count / evt.total_capacity) * 100)
              : 0;
            const availableSeats = Math.max(0, evt.total_capacity - evt.registered_count);

            return (
              <div
                key={evt.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow transition-shadow dark:border-slate-800 dark:bg-slate-900"
              >
                
                {/* Card Top */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md">
                      <Tag className="h-3 w-3" />
                      <span>{evt.category}</span>
                    </span>

                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {evt.ticket_price > 0 ? `₹${evt.ticket_price}` : 'Free Entry'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {evt.description}
                  </p>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span>{new Date(evt.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{evt.venue}, {evt.location}</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Capacity & Action */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  
                  {/* Capacity Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">
                        {availableSeats > 0 ? `${availableSeats} seats left` : 'Sold Out'}
                      </span>
                      <span className="text-slate-400 font-medium">{fillRate}% filled</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          availableSeats <= 5 ? 'bg-amber-500' : 'bg-teal-600'
                        }`}
                        style={{ width: `${Math.min(fillRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Button */}
                  <Link
                    to={`/events/${evt.id}`}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-900 text-white hover:bg-teal-600 text-xs font-semibold transition-colors dark:bg-slate-800 dark:hover:bg-teal-600"
                  >
                    <span>View Details & Register</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
