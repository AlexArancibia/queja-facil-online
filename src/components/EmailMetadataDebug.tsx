import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBranchEmailMetadataSync } from '@/lib/emailHelpers';
import { useBranchesStore } from '@/stores/branchesStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code2, Database, Mail, Users } from 'lucide-react';

const EmailMetadataDebug = () => {
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [metadata, setMetadata] = useState(null);
  const { branches } = useBranchesStore();

  const generateMetadata = (type: 'complaint' | 'rating' | 'status_update') => {
    if (!selectedBranchId) return;
    
    const result = getBranchEmailMetadataSync(selectedBranchId, type, 'debug-entity-123');
    setMetadata({ ...result, type });
  };

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="border-dashed border-amber-300 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="text-amber-800 flex items-center">
          <Code2 className="h-5 w-5 mr-2" />
          Email Metadata Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateMetadata('complaint')}
            disabled={!selectedBranchId}
          >
            Test Queja
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateMetadata('rating')}
            disabled={!selectedBranchId}
          >
            Test Rating
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateMetadata('status_update')}
            disabled={!selectedBranchId}
          >
            Test Update
          </Button>
        </div>

        {metadata && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center mb-2">
              <Database className="h-4 w-4 mr-2" />
              <span className="text-white">Email Metadata:</span>
            </div>
            <pre className="overflow-x-auto">
{JSON.stringify(metadata, null, 2)}
            </pre>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  <span>Branch: {metadata.branchName}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>Managers: {metadata.managers?.length || 0}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {metadata.type}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailMetadataDebug; 