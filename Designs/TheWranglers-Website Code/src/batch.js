import { supabase } from "./supabaseClient";

// Gets the next X cars in the queue and assigns them to the correct supabase station
async function Batch(){
    // get number of stations
    const stations = await supabase 
        .from("stations")
        .select("*");

    // while queue not empty
    
    //  get X cars from queue
        // get queue where status is pending
    const nextCars = await supabase
        .from("queue")
        .select("*")
        .eq("status", "NA")
        .order("created_at", ascending=true)
        .limit(stations.length);
    
        // assign each to a station
    nextCars.forEach(car=> {
        // add to Cars_stations join table
    });
    
}