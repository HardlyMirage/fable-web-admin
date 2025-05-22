import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Table } from '../../components/ui/table';
import { Pagination } from '../../components/ui/pagination';
import apiClient from '../../lib/api-client';

interface University {
  id: number;
  name: string;
  location: string;
  website: string;
  isActive: boolean;
  createdAt: string;
}

const UniversitiesList: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchUniversities();
  }, [page]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/universities?page=${page}&limit=${limit}`);
      setUniversities(response.data.items);
      setTotalItems(response.data.total);
      setTotalPages(Math.ceil(response.data.total / limit));
    } catch (err) {
      setError('Failed to fetch universities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this university?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/universities/${id}`);
      fetchUniversities();
    } catch (err) {
      setError('Failed to delete university');
      console.error(err);
    }
  };

  if (loading && universities.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Universities</h1>
          <Button as={Link} to="/universities/new">Add University</Button>
        </div>
        <Card>
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Universities</h1>
        <Button as={Link} to="/universities/new">Add University</Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            className="underline mt-2" 
            onClick={fetchUniversities}
          >
            Try Again
          </button>
        </div>
      )}
      
      <Card>
        <Table>
          <thead>
            <tr>
              <th className="w-20">ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Website</th>
              <th>Status</th>
              <th className="w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {universities.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No universities found
                </td>
              </tr>
            ) : (
              universities.map((university) => (
                <tr key={university.id}>
                  <td>{university.id}</td>
                  <td>{university.name}</td>
                  <td>{university.location || '-'}</td>
                  <td>
                    {university.website ? (
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {university.website}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        university.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {university.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <Button
                        as={Link}
                        to={`/universities/${university.id}`}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(university.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
};

export default UniversitiesList;
