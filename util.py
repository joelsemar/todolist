import types

def toDict(obj):
    """ 
    Returns a dict representation of the given object, replacing object relations with ids
    this is handy for serializing a django model instance
    """
    ret = {}
    for k, v in obj.__dict__.iteritems():
        if k.startswith('_'): # ignore 'private' keys
            continue
        elif type(v) is types.ObjectType:
            ret[k] = toDict(v)
        elif hasattr(v, 'id'):
            ret[k] = v.id
        else:
            ret[k] = v
    
    return ret


def strToBool(str):
    if not isinstance(str, basestring):
        raise TypeError
    
    return str in ['1', 'True', 'true']