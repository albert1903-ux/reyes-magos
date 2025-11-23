import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ChildContext = createContext();

export const ChildProvider = ({ children }) => {
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [childrenList, setChildrenList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const { data, error } = await supabase
                    .from('children')
                    .select('*')
                    .order('name');

                if (error) throw error;

                setChildrenList(data);
                if (data.length > 0) {
                    setSelectedChildId(data[0].id);
                }
            } catch (error) {
                console.error('Error fetching children:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChildren();
    }, []);

    return (
        <ChildContext.Provider value={{ selectedChildId, setSelectedChildId, childrenList, loading }}>
            {children}
        </ChildContext.Provider>
    );
};

export const useChild = () => useContext(ChildContext);
