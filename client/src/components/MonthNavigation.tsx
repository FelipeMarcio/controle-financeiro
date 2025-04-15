import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthNavigationProps {
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
}

const MonthNavigation = ({ 
  currentMonth, 
  currentYear, 
  setCurrentMonth, 
  setCurrentYear 
}: MonthNavigationProps) => {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={goToPreviousMonth}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>
      
      <h2 className="text-xl font-semibold text-gray-800">
        {monthNames[currentMonth]} {currentYear}
      </h2>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={goToNextMonth}
        className="flex items-center gap-1"
      >
        Próximo
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MonthNavigation;
