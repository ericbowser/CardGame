import { useContext } from 'react';
import { TableVisualContext } from '../context/tableVisualContext';

/** Table-only context so count/chip updates do not rebuild the 3D canvas. */
export function useTableSceneState() {
    const context = useContext(TableVisualContext);
    if (!context) {
        throw new Error('useTableSceneState must be used within a GameProvider');
    }
    return context;
}
