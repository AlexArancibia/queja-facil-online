import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useInstructorsStore } from '@/stores/instructorsStore';
import { useBranchesStore } from '@/stores/branchesStore';
import { useRatingsStore } from '@/stores/ratingsStore';
import { type Instructor, type CreateInstructorDto, type UpdateInstructorDto, Discipline } from '@/types/api';
import { User, Plus, Trash2, Edit, GraduationCap, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface InstructorFormData {
  name: string;
  discipline: Discipline;
  branchId: string;
  email?: string;
  phone?: string;
}

const InstructorManagement = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);

  // Stores
  const { 
    instructors, 
    loading: instructorsLoading, 
    fetchInstructors, 
    createInstructor, 
    updateInstructor, 
    deleteInstructor 
  } = useInstructorsStore();
  
  const { 
    branches, 
    loading: branchesLoading, 
    fetchBranches 
  } = useBranchesStore();

  const { ratings, fetchRatings, loading: ratingsLoading } = useRatingsStore();
  // Estado para dialog de resumen
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<InstructorFormData>();

  useEffect(() => {
    fetchInstructors();
    fetchBranches();
  }, [fetchInstructors, fetchBranches]);

  const onSubmit = async (data: InstructorFormData) => {
    try {
      if (editingInstructor) {
        const updateData: UpdateInstructorDto = {
          name: data.name,
          discipline: data.discipline,
          branchId: data.branchId,
          email: data.email || undefined,
          phone: data.phone || undefined
        };
        await updateInstructor(editingInstructor.id, updateData);
        toast({
          title: "Instructor actualizado",
          description: "Los datos del instructor se han actualizado correctamente.",
        });
      } else {
        const createData: CreateInstructorDto = {
          name: data.name,
          discipline: data.discipline,
          branchId: data.branchId,
          email: data.email || undefined,
          phone: data.phone || undefined
        };
        await createInstructor(createData);
        toast({
          title: "Instructor agregado",
          description: "El instructor se ha agregado correctamente.",
        });
      }
      
      setIsDialogOpen(false);
      setEditingInstructor(null);
      reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el instructor.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setValue('name', instructor.name);
    setValue('discipline', instructor.discipline);
    setValue('branchId', instructor.branchId);
    setValue('email', instructor.email || '');
    setValue('phone', instructor.phone || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (instructorId: string) => {
    try {
      await deleteInstructor(instructorId);
      toast({
        title: "Instructor eliminado",
        description: "El instructor se ha eliminado correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el instructor.",
        variant: "destructive",
      });
    }
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : branchId;
  };

  const getDisciplineColor = (discipline: Discipline) => {
    switch (discipline) {
      case Discipline.SICLO: return 'bg-blue-100 text-blue-800 border-blue-200';
      case Discipline.BARRE: return 'bg-purple-100 text-purple-800 border-purple-200';
      case Discipline.YOGA: return 'bg-green-100 text-green-800 border-green-200';
      case Discipline.EJERCITO: return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDisciplineText = (discipline: Discipline) => {
    switch (discipline) {
      case Discipline.SICLO: return 'SICLO';
      case Discipline.BARRE: return 'BARRE';
      case Discipline.YOGA: return 'YOGA';
      case Discipline.EJERCITO: return 'EJERCITO';
      default: return discipline;
    }
  };

  // Función para obtener calificaciones del instructor
  const getInstructorRatings = (instructorId: string) => {
    return ratings.filter(r => r.instructorId === instructorId);
  };
  const getInstructorAverage = (instructorId: string) => {
    const instructorRatings = getInstructorRatings(instructorId);
    if (instructorRatings.length === 0) return 0;
    return (
      instructorRatings.reduce((acc, r) => acc + (
        r.instructorRating +
        r.cleanlinessRating +
        r.audioRating +
        r.attentionQualityRating +
        r.amenitiesRating +
        r.punctualityRating
      ) / 6, 0) / instructorRatings.length
    );
  };

  if (instructorsLoading || branchesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-siclo-green" />
        <span className="ml-2 text-siclo-dark">Cargando instructores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-siclo-dark">Gestión de Instructores</h2>
          <p className="text-siclo-dark/60">Administra los instructores de todas las sucursales</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingInstructor(null);
                reset();
              }}
              className="siclo-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingInstructor ? 'Editar Instructor' : 'Agregar Instructor'}
              </DialogTitle>
              <DialogDescription>
                {editingInstructor 
                  ? 'Modifica los datos del instructor.' 
                  : 'Completa la información del nuevo instructor.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre completo *</Label>
                <Input
                  {...register('name', { required: 'El nombre es requerido' })}
                  placeholder="Ej: María González"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="maria@siclo.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  {...register('phone')}
                  placeholder="+51 999 888 777"
                />
              </div>

              <div className="space-y-2">
                <Label>Disciplina *</Label>
                <Select onValueChange={(value) => setValue('discipline', value as Discipline)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Discipline).map((discipline) => (
                      <SelectItem key={discipline} value={discipline}>
                        {getDisciplineText(discipline)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.discipline && <p className="text-red-500 text-sm">{errors.discipline.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Sucursal *</Label>
                <Select onValueChange={(value) => setValue('branchId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una sucursal" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.filter(b => b.isActive).map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.branchId && <p className="text-red-500 text-sm">{errors.branchId.message}</p>}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="siclo-button">
                  {editingInstructor ? 'Actualizar' : 'Guardar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingInstructor(null);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructors.map((instructor) => (
          <Card key={instructor.id} className="siclo-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-siclo-green" />
                  <CardTitle className="text-lg text-siclo-dark">{instructor.name}</CardTitle>
                </div>
                <Badge 
                  variant={instructor.isActive ? "default" : "secondary"}
                  className={instructor.isActive ? "bg-siclo-green/10 text-siclo-green" : "bg-gray-100 text-gray-600"}
                >
                  {instructor.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-siclo-blue" />
                <p className="text-sm text-siclo-dark/70">{getBranchName(instructor.branchId)}</p>
              </div>
              
              <Badge className={`${getDisciplineColor(instructor.discipline)} border`}>
                {getDisciplineText(instructor.discipline)}
              </Badge>

              {instructor.email && (
                <div className="text-sm text-siclo-dark/70">
                  <span className="font-medium">Email:</span> {instructor.email}
                </div>
              )}

              {instructor.phone && (
                <div className="text-sm text-siclo-dark/70">
                  <span className="font-medium">Tel:</span> {instructor.phone}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleEdit(instructor)}
                  variant="outline"
                  size="sm"
                  className="border-siclo-green/30 text-siclo-green hover:bg-siclo-green hover:text-white"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  onClick={() => handleDelete(instructor.id)}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Eliminar
                </Button>
                <Button
                  onClick={() => { setSelectedInstructor(instructor); setSummaryDialogOpen(true); fetchRatings(); }}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Ver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {instructors.length === 0 && !instructorsLoading && (
        <Card className="siclo-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 text-siclo-green/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-siclo-dark mb-2">
                No hay instructores registrados
              </h3>
              <p className="text-siclo-dark/60">
                Comienza agregando el primer instructor al sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de resumen de calificaciones del instructor */}
      <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resumen de Calificaciones</DialogTitle>
          </DialogHeader>
          {selectedInstructor && (
            <div className="space-y-2">
              <div className="font-medium text-siclo-dark text-lg">{selectedInstructor.name}</div>
              <div className="text-sm text-siclo-dark/70">{getBranchName(selectedInstructor.branchId)}</div>
              <div className="flex gap-4 mt-2">
                <div>
                  <span className="font-medium">Total calificaciones: </span>
                  {getInstructorRatings(selectedInstructor.id).length}
                </div>
                <div>
                  <span className="font-medium">Promedio: </span>
                  {getInstructorRatings(selectedInstructor.id).length > 0 ? getInstructorAverage(selectedInstructor.id).toFixed(2) : 'N/A'}
                </div>
              </div>
              {/* Lista breve de últimas calificaciones */}
              <div className="mt-2">
                <div className="font-medium text-xs text-siclo-dark/60 mb-1">Últimas calificaciones:</div>
                <ul className="text-xs text-siclo-dark/80 space-y-1 max-h-32 overflow-y-auto">
                  {getInstructorRatings(selectedInstructor.id).slice(-5).reverse().map(r => (
                    <li key={r.id} className="border-b last:border-b-0 pb-1">
                      <span className="font-semibold">{new Date(r.createdAt).toLocaleDateString('es-ES')}</span> — NPS: {r.npsScore}, Promedio: {((r.instructorRating + r.cleanlinessRating + r.audioRating + r.attentionQualityRating + r.amenitiesRating + r.punctualityRating) / 6).toFixed(2)}
                    </li>
                  ))}
                  {getInstructorRatings(selectedInstructor.id).length === 0 && (
                    <li className="text-siclo-dark/40">Sin calificaciones</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorManagement;
