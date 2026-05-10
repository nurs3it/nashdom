'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { propertiesApi } from '@/shared/api';
import type { PropertyFilters as PropertyFiltersType } from '@/shared/types/api';

interface PropertyFiltersProps {
  filters: PropertyFiltersType;
  onFiltersChange: (filters: PropertyFiltersType) => void;
  onSearch: () => void;
}

export function PropertyFilters({ filters, onFiltersChange, onSearch }: PropertyFiltersProps) {
  const [localFilters, setLocalFilters] = useState<PropertyFiltersType>(filters);

  // Загрузка справочников
  const { data: propertyTypes } = useQuery({
    queryKey: ['property-types'],
    queryFn: propertiesApi.getPropertyTypes,
  });

  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: propertiesApi.getServiceTypes,
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof PropertyFiltersType, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onSearch();
  };

  const handleResetFilters = () => {
    const resetFilters: PropertyFiltersType = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onSearch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Фильтры поиска</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Поиск */}
        <div className="space-y-2">
          <Label htmlFor="search">Поиск</Label>
          <Input
            id="search"
            placeholder="Поиск по названию, описанию, адресу..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Тип недвижимости */}
        <div className="space-y-2">
          <Label>Тип недвижимости</Label>
          <Select
            value={localFilters.property_type?.toString() || 'all'}
            onValueChange={(value) => handleFilterChange('property_type', value === 'all' ? undefined : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              {propertyTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Вид услуги */}
        <div className="space-y-2">
          <Label>Вид услуги</Label>
          <Select
            value={localFilters.service_type?.toString() || 'all'}
            onValueChange={(value) => handleFilterChange('service_type', value === 'all' ? undefined : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите услугу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все услуги</SelectItem>
              {serviceTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Город */}
        <div className="space-y-2">
          <Label htmlFor="city">Город</Label>
          <Input
            id="city"
            placeholder="Введите название города"
            value={localFilters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          />
        </div>

        {/* Цена */}
        <div className="space-y-2">
          <Label>Цена, ₸</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="От"
              value={localFilters.price_min || ''}
              onChange={(e) => handleFilterChange('price_min', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="До"
              value={localFilters.price_max || ''}
              onChange={(e) => handleFilterChange('price_max', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Площадь */}
        <div className="space-y-2">
          <Label>Площадь, м²</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="От"
              value={localFilters.area_min || ''}
              onChange={(e) => handleFilterChange('area_min', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="До"
              value={localFilters.area_max || ''}
              onChange={(e) => handleFilterChange('area_max', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Количество комнат */}
        <div className="space-y-2">
          <Label>Количество комнат</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="От"
              value={localFilters.rooms_min || ''}
              onChange={(e) => handleFilterChange('rooms_min', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="До"
              value={localFilters.rooms_max || ''}
              onChange={(e) => handleFilterChange('rooms_max', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex space-x-2 pt-4">
          <Button onClick={handleApplyFilters} className="flex-1">
            Применить
          </Button>
          <Button variant="outline" onClick={handleResetFilters}>
            Сбросить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
