import React from 'react';
import { Construction } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

const LOLD = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-boxdark p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="animate-bounce mb-8">
            <Construction size={64} className="text-primary" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-black mb-4">
            Coming Soon
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
            We're working hard to bring you something amazing. Stay tuned!
          </p>
          
          <div className="w-full max-w-md bg-primary/10 rounded-lg p-4">
            <p className="text-primary text-sm">
              This page is under construction and will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LOLD;