import { getData } from '$api/_blizzard'
import { getProfile } from '$api/profile'
import { getJsonDb } from '$api/_db'
import { parseCollectablesObject } from '$api/_collectables'
import Cache from '$api/_cache'

let _cache;
export async function getBattlePets(region, realm, character) {
    if (!_cache) {
        _cache = new Cache(region, realm, character);
    }
    else if (_cache.isValid(region, realm, character)) {
        return _cache.cache;
    }

    console.log(`Getting Battle Pets...`)
    
    // get profile
    const profile = await getProfile(region, realm, character);
    if (!profile || (profile.status && profile.status === 404)) {
        return undefined;
    }

    // get json
    const db = await getJsonDb('battlepets');
    
    // get character collected
    const collected = await getData(region, realm, character, 'collections/pets');
    
    // combine
    _cache.update(
        region,
        realm,
        character,
        parseCollectablesObject(db, profile, collected, 'pets', 'species', true)
    )
    return _cache.cache;
}