import React from 'react';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

export const LoadingState: React.FC = () => {
  return (
    <Card className="studio-grid-container">
      <div className="grid">
        <div className="col-12">
          <Skeleton height="3rem" className="mb-3" />
          <Skeleton height="400px" />
        </div>
      </div>
    </Card>
  );
};

