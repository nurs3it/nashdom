'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Maximize2,
  Grid3x3,
  Play,
  Pause,
  Share2,
  Heart,
  Expand,
  Minimize
} from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  onFavoriteToggle?: () => void;
  isFavorited?: boolean;
}

export function PropertyGallery({ images, title, onFavoriteToggle, isFavorited }: PropertyGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fitMode, setFitMode] = useState<'contain' | 'cover' | 'fill'>('contain');
  
  const imageRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Автопроигрывание
  useEffect(() => {
    if (isAutoPlay && isFullscreen) {
      autoPlayRef.current = setInterval(() => {
        setSelectedImageIndex(prev => (prev + 1) % images.length);
      }, 3000);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [isAutoPlay, isFullscreen, images.length]);

  // Клавиатурные сокращения
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeFullscreen();
          break;
        case 'ArrowLeft':
          navigateImage('prev');
          break;
        case 'ArrowRight':
          navigateImage('next');
          break;
        case ' ':
          e.preventDefault();
          setIsAutoPlay(prev => !prev);
          break;
        case '+':
        case '=':
          handleZoom('in');
          break;
        case '-':
          handleZoom('out');
          break;
        case '0':
          resetZoom();
          break;
        case 'r':
          handleRotate();
          break;
        case 'd':
          handleDownload();
          break;
        case 'g':
          setIsGridView(prev => !prev);
          break;
        case 'f':
          const modes: ('contain' | 'cover' | 'fill')[] = ['contain', 'cover', 'fill'];
          const currentIndex = modes.indexOf(fitMode);
          const nextIndex = (currentIndex + 1) % modes.length;
          setFitMode(modes[nextIndex]);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, selectedImageIndex, images.length]);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    } else {
      setSelectedImageIndex(prev => (prev + 1) % images.length);
    }
    resetZoom();
  };

  const openFullscreen = (index?: number) => {
    if (index !== undefined) {
      setSelectedImageIndex(index);
    }
    setIsFullscreen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setIsGridView(false);
    setIsAutoPlay(false);
    resetZoom();
    document.body.style.overflow = 'unset';
  };

  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (type === 'in') {
      setZoom(prev => Math.min(prev * 1.5, 5));
    } else if (type === 'out') {
      setZoom(prev => Math.max(prev / 1.5, 0.5));
    } else {
      setZoom(1);
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = async () => {
    const currentImage = images[selectedImageIndex];
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}-${selectedImageIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    const currentImage = images[selectedImageIndex];
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Фото ${selectedImageIndex + 1} из ${images.length}`,
          url: currentImage,
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      navigator.clipboard.writeText(currentImage);
    }
  };

  // Обработка перетаскивания для панорамирования
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch события для мобильных устройств
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - imagePosition.x, y: touch.clientY - imagePosition.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    setImagePosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4">📷</div>
          <p>Изображения отсутствуют</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Основная галерея */}
      <div className="space-y-4">
        {/* Главное изображение */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg group cursor-pointer">
          <Image
            src={images[selectedImageIndex]}
            alt={`${title} - ${selectedImageIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onClick={() => openFullscreen()}
          />
          
          {/* Оверлей с информацией */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="secondary" className="bg-black/50 text-white">
                {selectedImageIndex + 1} / {images.length}
              </Badge>
              <Badge variant="secondary" className="bg-black/50 text-white">
                <Maximize2 className="h-3 w-3 mr-1" />
                Увеличить
              </Badge>
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2">
              {onFavoriteToggle && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavoriteToggle();
                  }}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                </Button>
              )}
              
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button
                variant="secondary"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={() => openFullscreen()}
              >
                <Play className="h-4 w-4 mr-2" />
                Слайд-шоу
              </Button>
            </div>
          </div>

          {/* Навигационные стрелки */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Миниатюры */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "relative w-20 h-16 flex-shrink-0 overflow-hidden rounded cursor-pointer border-2 transition-all",
                  selectedImageIndex === index 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-muted-foreground'
                )}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={image}
                  alt={`${title} - миниатюра ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {selectedImageIndex === index && (
                  <div className="absolute inset-0 bg-primary/20" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Полноэкранный просмотр */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Панель управления */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
                
                <div className="text-white">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-white/70">
                    {selectedImageIndex + 1} из {images.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsGridView(!isGridView)}
                  className="text-white hover:bg-white/20"
                >
                  <Grid3x3 className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className="text-white hover:bg-white/20"
                >
                  {isAutoPlay ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Основное содержимое */}
          {isGridView ? (
            /* Сетка изображений */
            <div className="px-4 overflow-auto" style={{ paddingTop: '80px', paddingBottom: '80px', height: '100vh' }}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-lg cursor-pointer border-2 transition-all",
                      selectedImageIndex === index 
                        ? 'border-primary ring-2 ring-primary/50' 
                        : 'border-transparent hover:border-white/50'
                    )}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsGridView(false);
                    }}
                  >
                    <Image
                      src={image}
                      alt={`${title} - ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Просмотр одного изображения */
            <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 160px)', marginTop: '80px', marginBottom: '80px' }}>
              <div
                ref={imageRef}
                className="relative cursor-grab active:cursor-grabbing"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  transform: `scale(${zoom}) rotate(${rotation}deg) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <Image
                  src={images[selectedImageIndex]}
                  alt={`${title} - ${selectedImageIndex + 1}`}
                  width={1200}
                  height={800}
                  className={`object-${fitMode}`}
                  style={{ 
                    pointerEvents: 'none',
                    maxWidth: fitMode === 'contain' ? 'min(90vw, 1200px)' : '100%',
                    maxHeight: fitMode === 'contain' ? 'min(calc(100vh - 160px), 800px)' : '100%',
                    width: fitMode === 'fill' ? '90vw' : 'auto',
                    height: fitMode === 'fill' ? 'calc(100vh - 160px)' : 'auto'
                  }}
                />
              </div>

              {/* Навигация */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="absolute left-2 md:left-4 text-white hover:bg-white/20 z-10 bg-black/30 backdrop-blur-sm"
                    style={{ top: 'calc(50vh - 20px)' }}
                    onClick={() => navigateImage('prev')}
                  >
                    <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    className="absolute right-2 md:right-4 text-white hover:bg-white/20 z-10 bg-black/30 backdrop-blur-sm"
                    style={{ top: 'calc(50vh - 20px)' }}
                    onClick={() => navigateImage('next')}
                  >
                    <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Нижняя панель управления */}
          {!isGridView && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom('out')}
                  disabled={zoom <= 0.5}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                
                <Badge variant="secondary" className="bg-black/50 text-white px-3 py-1">
                  {Math.round(zoom * 100)}%
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom('in')}
                  disabled={zoom >= 5}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCw className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom('reset')}
                  className="text-white hover:bg-white/20"
                >
                  Сбросить
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const modes: ('contain' | 'cover' | 'fill')[] = ['contain', 'cover', 'fill'];
                    const currentIndex = modes.indexOf(fitMode);
                    const nextIndex = (currentIndex + 1) % modes.length;
                    setFitMode(modes[nextIndex]);
                  }}
                  className="text-white hover:bg-white/20"
                  title={`Режим: ${fitMode === 'contain' ? 'Вместить' : fitMode === 'cover' ? 'Заполнить' : 'Растянуть'}`}
                >
                  {fitMode === 'contain' ? <Minimize className="h-5 w-5" /> : 
                   fitMode === 'cover' ? <Maximize2 className="h-5 w-5" /> : 
                   <Expand className="h-5 w-5" />}
                </Button>
              </div>

              {/* Индикаторы изображений */}
              {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        selectedImageIndex === index 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/75'
                      )}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Подсказки по клавишам */}
          <div className="absolute top-20 right-4 text-white/70 text-xs space-y-1 hidden lg:block">
            <div>ESC - Закрыть</div>
            <div>← → - Навигация</div>
            <div>Space - Автопроигрывание</div>
            <div>+ - - Зум</div>
            <div>R - Поворот</div>
            <div>F - Режим отображения</div>
            <div>D - Скачать</div>
            <div>G - Сетка</div>
          </div>
        </div>
      )}
    </>
  );
}
