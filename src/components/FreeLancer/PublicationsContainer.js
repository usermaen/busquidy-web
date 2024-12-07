import React, { useState } from 'react';
import SearchPublicationSection from './SearchPublicationSection';
import PublicationList from './PublicationList';

function PublicationsContainer({ userType, id_usuario }) {
  const [filters, setFilters] = useState({
    searchText: '',
    projectSize: 'todos',
    sortBy: 'relevancia',
    date: 'todos',
    modality: 'todos',
    disability: 'todos',
    experience: 'todos',
    career: 'todos',
    region: 'todos',
    commune: 'todos',
    workday: 'todos',
    workArea: 'todos'
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="publications-container">
      <SearchPublicationSection onFilterChange={handleFilterChange} />
      <PublicationList 
        userType={userType} 
        id_usuario={id_usuario} 
        filters={filters} 
      />
    </div>
  );
}

export default PublicationsContainer;