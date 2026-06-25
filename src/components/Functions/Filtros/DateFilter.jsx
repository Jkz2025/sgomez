//Filtro reutilizable para filtrar visitas, programas y visitas R por fecha y asesor.

import React from 'react'
import { Calendar, Filter } from 'lucide-react'

const DateFilter = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onApplyFilter,
    className = ''
}) => {
    //Funcion  para obtener la fecha actual en formato YYYY-MM-DD
    const getCurrentDate = () => {
        return new Date().toISOString().split('T')[0];
    }

  return (

    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 ${className}`}>
<div className="flex items-center mb-4">
<Filter className='w-5 h-5 text-blue-400 mr-2'/>
<h3 className="text-lg font-semibold">
Filtrar por fecha
</h3>
</div>

<div className="grid grid-cols-1 md:grids-cols-3 gap-4 items-end">
<div>
    <label  className="block text-sm font-medium text-gray-300 mb-2">
        Desde
    </label>

    <div className="relative">
    <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400'/>
     
        <input type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)} 
    className='w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-w focus:ring-blue-500 focus:border-transparent text-white' />
       
        
    </div>
</div>

<div>
    <label className='block text-sm font-medium text-gray-300 mb-2'>Hasta</label>
<div className="relative">
    <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400'/>
    <input type="date"
    value={endDate}
    onChange={(e) => onEndDateChange(e.target.value)}
    min={startDate}
    className='w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-w focus:ring-blue-500 focus:border-transparent text-white' />
</div>
</div>

<button onClick={onApplyFilter}
className='bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 py-2 rounded-lg transition-all duration-300 font-medium'>
Buscar
</button>
</div>
    </div>
)
}

export default DateFilter