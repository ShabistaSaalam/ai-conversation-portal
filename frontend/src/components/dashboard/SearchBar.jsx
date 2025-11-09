import { Search, Calendar } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';

const SearchBar = ({ onSearch, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
    },
  ]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    onFilterChange({
      status: value,
      start_date: range[0].startDate
        ? format(range[0].startDate, 'yyyy-MM-dd')
        : '',
      end_date: range[0].endDate
        ? format(range[0].endDate, 'yyyy-MM-dd')
        : '',
    });
  };

  const handleDateSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;

    setRange([ranges.selection]);

    if (startDate && endDate) {
      onFilterChange({
        status,
        start_date: startDate,
        end_date: endDate,
      });

    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 relative">
      <div className="flex flex-col md:flex-row gap-4 items-center">

        {/* ✅ Search Input - Left */}
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* ✅ Status Filter - Middle */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
        </select>

        {/* ✅ Date Range Trigger - Rightmost */}
        <div className="relative ml-auto">
          <button
            onClick={() => setCalendarOpen(!calendarOpen)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white flex items-center gap-2
                       hover:bg-gray-100"
          >
            <Calendar className="h-5 w-5 text-gray-600" />

            {range[0].startDate && range[0].endDate ? (
              <span>
                {format(range[0].startDate, 'dd MMM')} -{' '}
                {format(range[0].endDate, 'dd MMM')}
              </span>
            ) : (
              <span className="text-gray-600">Select Date Range</span>
            )}
          </button>

          {/* ✅ Calendar Popup */}
          {calendarOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-xl border rounded-lg p-2 z-50">
              <DateRange
                ranges={range}
                onChange={handleDateSelect}
                moveRangeOnFirstSelection={false}
                rangeColors={['#2563eb']}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
