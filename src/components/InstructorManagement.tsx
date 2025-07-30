import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useInstructorsStore } from '@/stores/instructorsStore';
import { useBranchesStore } from '@/stores/branchesStore';
import { useRatingsStore } from '@/stores/ratingsStore';
import { type Instructor, type CreateInstructorDto, type UpdateInstructorDto, Discipline } from '@/types/api';
import { User, Plus, Trash2, Edit, GraduationCap, Loader2, Mail, Phone, Store, Eye, MoreHorizontal, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface InstructorFormData {
  name: string;
  discipline: Discipline;
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
    fetchRatings(); // Cargar ratings para estadísticas
  }, [fetchInstructors, fetchBranches, fetchRatings]);

  const onSubmit = async (data: InstructorFormData) => {
    try {
      if (editingInstructor) {
        const updateData: UpdateInstructorDto = {
          name: data.name,
          discipline: data.discipline,
          email: data.email || undefined,
          phone: data.phone || undefined
        };
        await updateInstructor(editingInstructor.id, updateData);
        toast({
          title: "Instructor actualizado",
          description: "Los datos del instructor se han actualizado correctamente",
        });
      } else {
        const createData: CreateInstructorDto = {
          name: data.name,
          discipline: data.discipline,
          email: data.email || undefined,
          phone: data.phone || undefined
        };
        await createInstructor(createData);
        toast({
          title: "Instructor agregado",
          description: "El instructor se ha agregado correctamente al sistema",
        });
      }
      
      setIsDialogOpen(false);
      setEditingInstructor(null);
      reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el instructor",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setValue('name', instructor.name);
    setValue('discipline', instructor.discipline);
    setValue('email', instructor.email || '');
    setValue('phone', instructor.phone || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (instructorId: string, instructorName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${instructorName}? Esta acción no se puede deshacer.`)) {
      try {
        await deleteInstructor(instructorId);
        toast({
          title: "Instructor eliminado",
          description: `${instructorName} ha sido eliminado del sistema`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "No se pudo eliminar el instructor",
          variant: "destructive",
        });
      }
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
      {/* Header optimizado para móvil y desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-siclo-light/30">
        <div>
          <h2 className="text-xl font-bold text-siclo-dark flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Gestión de Instructores
          </h2>
          <p className="text-sm text-siclo-dark/70 mt-1">
            Administra los instructores de todas las sucursales ({instructors.length} instructores)
          </p>
        </div>
        <Button 
          className="bg-siclo-green text-white hover:bg-siclo-green/90 w-full sm:w-auto" 
          onClick={() => {
            setEditingInstructor(null);
            reset();
            setIsDialogOpen(true);
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Agregar Instructor
        </Button>
      </div>

      <Card className="siclo-card overflow-hidden">
        <CardContent className="p-0">
          {instructors.length > 0 ? (
            <>
              {/* Vista móvil - Cards */}
              <div className="lg:hidden">
                <div className="space-y-3 p-4">
                  {instructors.map((instructor) => (
                    <Card key={instructor.id} className="border border-siclo-light/50 hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header del instructor */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="flex-shrink-0 p-2 bg-siclo-green/10 rounded-lg">
                                <GraduationCap className="h-5 w-5 text-siclo-green" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-semibold text-siclo-dark truncate">{instructor.name}</p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    instructor.isActive ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-gray-300 text-gray-600 bg-gray-50'
                                  }`}
                                >
                                  {instructor.isActive ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedInstructor(instructor); setSummaryDialogOpen(true); }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver estadísticas
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(instructor); }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => { e.stopPropagation(); handleDelete(instructor.id, instructor.name); }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Información del instructor */}
                          <div className="space-y-2 text-sm">
   
                            <div className="flex items-center">
                              <Badge className={`${getDisciplineColor(instructor.discipline)} border text-xs`}>
                                {getDisciplineText(instructor.discipline)}
                              </Badge>
                            </div>
                            {instructor.email && (
                              <div className="flex items-center text-siclo-dark/70">
                                <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                                <span className="truncate text-xs">{instructor.email}</span>
                              </div>
                            )}
                            {instructor.phone && (
                              <div className="flex items-center text-siclo-dark/70">
                                <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                                <span className="text-xs">{instructor.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer con calificaciones */}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <div className="text-xs text-siclo-dark/60">
                              <span className="font-medium">{getInstructorRatings(instructor.id).length}</span> calificaciones
                            </div>
                            <div className="text-xs text-siclo-green font-medium">
                              Promedio: {getInstructorRatings(instructor.id).length > 0 ? getInstructorAverage(instructor.id).toFixed(1) : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Vista desktop - Tabla */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-siclo-dark">Instructor</TableHead>
                      <TableHead className="font-semibold text-siclo-dark">Disciplina</TableHead>
                      <TableHead className="font-semibold text-siclo-dark">Contacto</TableHead>
                      <TableHead className="font-semibold text-siclo-dark">Calificaciones</TableHead>
                      <TableHead className="font-semibold text-siclo-dark">Estado</TableHead>
                      <TableHead className="w-[100px] font-semibold text-siclo-dark">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instructors.map((instructor) => (
                      <TableRow key={instructor.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 p-2 bg-siclo-green/10 rounded-lg">
                              <GraduationCap className="h-4 w-4 text-siclo-green" />
                            </div>
                            <div>
                              <p className="font-medium text-siclo-dark">{instructor.name}</p>
                              <p className="text-sm text-siclo-dark/60">{instructor.email || 'Sin email'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getDisciplineColor(instructor.discipline)} border text-xs`}>
                            {getDisciplineText(instructor.discipline)}
                          </Badge>
                        </TableCell>
 
                        <TableCell>
                          {instructor.phone && (
                            <div className="flex items-center text-sm text-siclo-dark/70">
                              <Phone className="h-3 w-3 mr-1" />
                              {instructor.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-siclo-dark">
                              {getInstructorRatings(instructor.id).length} calificaciones
                            </div>
                            <div className="text-siclo-green text-xs">
                              Promedio: {getInstructorRatings(instructor.id).length > 0 ? getInstructorAverage(instructor.id).toFixed(1) : 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              instructor.isActive 
                                ? 'border-emerald-300 text-emerald-700 bg-emerald-50' 
                                : 'border-gray-300 text-gray-600 bg-gray-50'
                            }`}
                          >
                            {instructor.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem onClick={() => { setSelectedInstructor(instructor); setSummaryDialogOpen(true); }}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver estadísticas
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(instructor)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(instructor.id, instructor.name)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center text-siclo-dark/60 py-16">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No hay instructores registrados</h3>
              <p className="text-sm text-siclo-dark/50 mb-6">
                Comienza agregando el primer instructor al sistema
              </p>
              <Button 
                className="bg-siclo-green text-white hover:bg-siclo-green/90" 
                onClick={() => {
                  setEditingInstructor(null);
                  reset();
                  setIsDialogOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Primer Instructor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de formulario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-siclo-dark text-xl">
              <GraduationCap className="h-6 w-6 mr-3 text-siclo-green" />
              {editingInstructor ? 'Editar Instructor' : 'Agregar Instructor'}
            </DialogTitle>
            <DialogDescription className="text-siclo-dark/70">
              {editingInstructor 
                ? 'Modifica los datos del instructor' 
                : 'Completa la información del nuevo instructor'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-siclo-dark font-medium flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Nombre completo *
                </Label>
                <Input
                  id="name"
                  {...register('name', { required: 'El nombre es requerido' })}
                  placeholder="Ej: María González"
                  className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-siclo-dark font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="maria@siclo.com"
                  className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-siclo-dark font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+51 999 888 777"
                  className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discipline" className="text-siclo-dark font-medium flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Disciplina *
                </Label>
                <Select onValueChange={(value) => setValue('discipline', value as Discipline)}>
                  <SelectTrigger className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20">
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
                {errors.discipline && <p className="text-sm text-red-600">{errors.discipline.message}</p>}
              </div>
            </div>

          

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 siclo-button">
                <UserPlus className="h-4 w-4 mr-2" />
                {editingInstructor ? 'Actualizar Instructor' : 'Agregar Instructor'}
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

      {/* Dialog de resumen de calificaciones del instructor */}
      <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-siclo-dark">
              <GraduationCap className="h-5 w-5 mr-2 text-siclo-green" />
              Estadísticas del Instructor
            </DialogTitle>
          </DialogHeader>
          {selectedInstructor && (
            <div className="space-y-4">
              <div className="bg-siclo-light/30 p-4 rounded-lg">
                <div className="font-medium text-siclo-dark text-lg">{selectedInstructor.name}</div>
 
                <div className="mt-2">
                  <Badge className={`${getDisciplineColor(selectedInstructor.discipline)} border text-xs`}>
                    {getDisciplineText(selectedInstructor.discipline)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">
                    {getInstructorRatings(selectedInstructor.id).length}
                  </div>
                  <div className="text-sm text-blue-600">Total calificaciones</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">
                    {getInstructorRatings(selectedInstructor.id).length > 0 ? getInstructorAverage(selectedInstructor.id).toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-green-600">Promedio general</div>
                </div>
              </div>

              {/* Lista de últimas calificaciones */}
              {getInstructorRatings(selectedInstructor.id).length > 0 && (
                <div>
                  <div className="font-medium text-sm text-siclo-dark mb-3">Últimas calificaciones:</div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {getInstructorRatings(selectedInstructor.id).slice(-5).reverse().map(r => (
                      <div key={r.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <div className="font-medium text-siclo-dark">
                            {new Date(r.createdAt).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-siclo-dark/60 text-xs">
                            NPS: {r.npsScore}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-siclo-green">
                            {((r.instructorRating + r.cleanlinessRating + r.audioRating + r.attentionQualityRating + r.amenitiesRating + r.punctualityRating) / 6).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">Promedio</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {getInstructorRatings(selectedInstructor.id).length === 0 && (
                <div className="text-center py-8 text-siclo-dark/50">
                  <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Sin calificaciones aún</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorManagement;
