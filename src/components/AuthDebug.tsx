import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { apiHelpers } from '@/lib/api';
import apiClient from '@/lib/api';

const AuthDebug = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const { user, isAuthenticated } = useAuthStore();

  const addResult = (message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      data
    }]);
  };

  const testPublicEndpoints = async () => {
    addResult('🧪 Iniciando pruebas de endpoints públicos...');
    
    try {
      // Test branches endpoint
      addResult('📡 Probando endpoint /branches...');
      const branchesResponse = await apiClient.get('/branches?active=true');
      addResult('✅ Branches obtenidas exitosamente', {
        count: branchesResponse.data.length,
        firstBranch: branchesResponse.data[0]?.name
      });
    } catch (error: any) {
      addResult('❌ Error en /branches', {
        status: error.response?.status,
        message: error.response?.data?.message
      });
    }

    try {
      // Test instructors endpoint
      addResult('📡 Probando endpoint /instructors...');
      const instructorsResponse = await apiClient.get('/instructors?active=true');
      addResult('✅ Instructores obtenidos exitosamente', {
        count: instructorsResponse.data.length,
        firstInstructor: instructorsResponse.data[0]?.name
      });
    } catch (error: any) {
      addResult('❌ Error en /instructors', {
        status: error.response?.status,
        message: error.response?.data?.message
      });
    }
  };

  const testComplaintCreation = async () => {
    addResult('🧪 Probando creación de queja...');
    
    // Primero obtener una branch real
    try {
      const branchesResponse = await apiClient.get('/branches?active=true');
      if (branchesResponse.data.length === 0) {
        addResult('❌ No hay branches disponibles para la prueba');
        return;
      }
      
      const testBranch = branchesResponse.data[0];
      addResult('📋 Usando branch:', { id: testBranch.id, name: testBranch.name });
      
      const testComplaint = {
        fullName: "Usuario de Prueba",
        email: "test@example.com",
        branchId: testBranch.id,
        observationType: "Servicio",
        detail: "Esta es una queja de prueba para verificar la autenticación",
        priority: "MEDIUM",
        attachments: [
          {
            filename: "test-evidence.jpg",
            url: "https://example.com/test-evidence.jpg"
          }
        ]
      };

      addResult('📤 Enviando payload:', testComplaint);
      const response = await apiClient.post('/complaints', testComplaint);
      addResult('✅ Queja creada exitosamente', {
        id: response.data.id,
        status: response.data.status
      });
    } catch (error: any) {
      addResult('❌ Error creando queja', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headers: error.response?.config?.headers
      });
    }
  };

  const testRatingCreation = async () => {
    addResult('🧪 Probando creación de calificación...');
    
    // Primero obtener una branch e instructor reales
    try {
      const branchesResponse = await apiClient.get('/branches?active=true');
      if (branchesResponse.data.length === 0) {
        addResult('❌ No hay branches disponibles para la prueba');
        return;
      }
      
      const testBranch = branchesResponse.data[0];
      addResult('📋 Usando branch:', { id: testBranch.id, name: testBranch.name });
      
      const instructorsResponse = await apiClient.get(`/instructors?branchId=${testBranch.id}&active=true`);
      if (instructorsResponse.data.length === 0) {
        addResult('❌ No hay instructores disponibles para la prueba');
        return;
      }
      
      const testInstructor = instructorsResponse.data[0];
      addResult('👨‍🏫 Usando instructor:', { id: testInstructor.id, name: testInstructor.name });
      
      const testRating = {
        instructorId: testInstructor.id,
        branchId: testBranch.id,
        instructorName: testInstructor.name,
        discipline: testInstructor.discipline || "SICLO",
        schedule: "10:00 AM",
        date: "2024-01-15",
        instructorRating: 8,
        cleanlinessRating: 9,
        audioRating: 7,
        attentionQualityRating: 8,
        amenitiesRating: 8,
        punctualityRating: 9,
        npsScore: 8.5,
        comments: "Esta es una calificación de prueba"
      };

      addResult('📤 Enviando payload:', testRating);
      const response = await apiClient.post('/ratings', testRating);
      addResult('✅ Calificación creada exitosamente', {
        id: response.data.id,
        npsScore: response.data.npsScore
      });
    } catch (error: any) {
      addResult('❌ Error creando calificación', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headers: error.response?.config?.headers
      });
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (<></>
    // <Card className="siclo-card">
    //   <CardHeader>
    //     <CardTitle className="text-siclo-dark">🔧 Debug de Autenticación</CardTitle>
    //   </CardHeader>
    //   <CardContent className="space-y-4">
    //     {/* Estado actual */}
    //     <div className="bg-gray-50 p-4 rounded-lg">
    //       <h3 className="font-semibold mb-2">Estado Actual:</h3>
    //       <div className="grid grid-cols-2 gap-2 text-sm">
    //         <div>Autenticado: <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated ? 'SÍ' : 'NO'}</span></div>
    //         <div>Usuario: <span className="font-mono">{user?.name || 'Ninguno'}</span></div>
    //         <div>Rol: <span className="font-mono">{user?.role || 'Ninguno'}</span></div>
    //         <div>Token: <span className="font-mono">{apiHelpers.getAuthToken() ? 'Presente' : 'Ausente'}</span></div>
    //       </div>
    //     </div>

    //     {/* Botones de prueba */}
    //     <div className="flex flex-wrap gap-2">
    //       <Button onClick={testPublicEndpoints} variant="outline" size="sm">
    //         🧪 Probar Endpoints Públicos
    //       </Button>
    //       <Button onClick={testComplaintCreation} variant="outline" size="sm">
    //         📝 Probar Crear Queja
    //       </Button>
    //       <Button onClick={testRatingCreation} variant="outline" size="sm">
    //         ⭐ Probar Crear Calificación
    //       </Button>
    //       <Button onClick={clearResults} variant="outline" size="sm">
    //         🗑️ Limpiar Resultados
    //       </Button>
    //     </div>

    //     {/* Resultados */}
    //     <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
    //       <h3 className="font-semibold mb-2">Resultados de Pruebas:</h3>
    //       {testResults.length === 0 ? (
    //         <p className="text-gray-500 text-sm">No hay resultados de pruebas aún.</p>
    //       ) : (
    //         <div className="space-y-2">
    //           {testResults.map((result, index) => (
    //             <div key={index} className="text-sm border-l-2 border-gray-300 pl-2">
    //               <div className="font-mono text-xs text-gray-500">{result.timestamp}</div>
    //               <div>{result.message}</div>
    //               {result.data && (
    //                 <pre className="text-xs bg-white p-1 rounded mt-1 overflow-x-auto">
    //                   {JSON.stringify(result.data, null, 2)}
    //                 </pre>
    //               )}
    //             </div>
    //           ))}
    //         </div>
    //       )}
    //     </div>
    //   </CardContent>
    // </Card>
  );
};

export default AuthDebug; 