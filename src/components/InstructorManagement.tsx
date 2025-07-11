import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User, Plus, Trash2, Edit, GraduationCap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { MOCK_STORES } from '@/types/complaint';
import { DISCIPLINES, type Instructor } from '@/types/instructor';

interface InstructorFormData {
  name: string;
  discipline: 'siclo' | 'barre' | 'yoga' | 'ejercito';
  storeId: string;
}

const InstructorManagement = () => {
  const { toast } = useToast();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<InstructorFormData>();

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = () => {
    const savedInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');
    setInstructors(savedInstructors);
  };

  const saveInstructors = (updatedInstructors: Instructor[]) => {
    localStorage.setItem('instructors', JSON.stringify(updatedInstructors));
    setInstructors(updatedInstructors);
  };

  const onSubmit = (data: InstructorFormData) => {
    try {
      if (editingInstructor) {
        const updatedInstructors = instructors.map(instructor =>
          instructor.id === editingInstructor.id
            ? { ...instructor, ...data }
            : instructor
        );
        saveInstructors(updatedInstructors);
        toast({
          title: "Instructor actualizado",
          description: "Los datos del instructor se han actualizado correctamente.",
        });
      } else {
        const newInstructor: Instructor = {
          id: `instructor-${Date.now()}`,
          name: data.name,
          discipline: data.discipline,
          storeId: data.storeId,
          createdAt: new Date(),
          isActive: true
        };
        
        const updatedInstructors = [...instructors, newInstructor];
        saveInstructors(updatedInstructors);
        toast({
          title: "Instructor agregado",
          description: "El instructor se ha agregado correctamente.",
        });
      }
      
      setIsDialogOpen(false);
      setEditingInstructor(null);
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el instructor.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setValue('name', instructor.name);
    setValue('discipline', instructor.discipline);
    setValue('storeId', instructor.storeId);
    setIsDialogOpen(true);
  };

  const handleDelete = (instructorId: string) => {
    const updatedInstructors = instructors.filter(instructor => instructor.id !== instructorId);
    saveInstructors(updatedInstructors);
    toast({
      title: "Instructor eliminado",
      description: "El instructor se ha eliminado correctamente.",
    });
  };

  const toggleStatus = (instructorId: string) => {
    const updatedInstructors = instructors.map(instructor =>
      instructor.id === instructorId
        ? { ...instructor, isActive: !instructor.isActive }
        : instructor
    );
    saveInstructors(updatedInstructors);
    toast({
      title: "Estado actualizado",
      description: "El estado del instructor se ha actualizado.",
    });
  };

  const getStoreName = (storeId: string) => {
    const store = MOCK_STORES.find(s => s.id === storeId);
    return store ? store.name : storeId;
  };

  const getDisciplineColor = (discipline: string) => {
    switch (discipline) {
      case 'siclo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'barre': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'yoga': return 'bg-green-100 text-green-800 border-green-200';
      case 'ejercito': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-siclo-dark">Gestión de Instructores</h2>
          <p className="text-siclo-dark/60">Administra los instructores de todos los locales</p>
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
                <Label>Nombre completo</Label>
                <Input
                  {...register('name', { required: 'El nombre es requerido' })}
                  placeholder="Ej: María González"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Disciplina</Label>
                <Select onValueChange={(value) => setValue('discipline', value as 'siclo' | 'barre' | 'yoga' | 'ejercito')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCIPLINES.map((discipline) => (
                      <SelectItem key={discipline} value={discipline}>
                        {discipline.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.discipline && <p className="text-red-500 text-sm">{errors.discipline.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Local</Label>
                <Select onValueChange={(value) => setValue('storeId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un local" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_STORES.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.storeId && <p className="text-red-500 text-sm">{errors.storeId.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 siclo-button">
                  {editingInstructor ? 'Actualizar' : 'Agregar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="siclo-card">
        <CardHeader>
          <CardTitle className="flex items-center text-siclo-dark">
            <GraduationCap className="h-5 w-5 mr-2" />
            Instructores Registrados ({instructors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="border border-siclo-light/50 hover:shadow-md transition-all duration-300">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 mr-2 text-siclo-green" />
                        <h3 className="font-semibold text-siclo-dark">{instructor.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(instructor.id)}
                          className={`ml-2 h-6 px-2 text-xs ${
                            instructor.isActive 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {instructor.isActive ? 'Activo' : 'Inactivo'}
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getDisciplineColor(instructor.discipline)} border`}>
                            {instructor.discipline.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-siclo-dark/70">
                            {getStoreName(instructor.storeId)}
                          </span>
                        </div>
                        <p className="text-xs text-siclo-dark/60">
                          Registrado: {new Date(instructor.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(instructor)}
                        className="text-siclo-blue border-siclo-blue/30 hover:bg-siclo-blue hover:text-white"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(instructor.id)}
                        className="text-red-600 border-red-300 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {instructors.length === 0 && (
              <div className="text-center text-siclo-dark/60 py-12">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No hay instructores registrados</p>
                <p className="text-sm">Agrega el primer instructor para comenzar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorManagement;
